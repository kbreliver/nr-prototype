<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

import {
  LeftOutlined,
  RightOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons-vue';
import { message, Tooltip } from 'ant-design-vue';

const newsImagePlaceholder =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad4ab?w=400&h=200&fit=crop&auto=format';

// 右侧新闻条目高度/间距，用于根据容器高度动态计算可展示条数
const NEWS_ROW_HEIGHT = 32; // 对应 `h-8`
const NEWS_ROW_GAP = 8; // 对应 `gap-2`
const MAX_VISIBLE_NEWS = 10;

type FeaturedNewsItem = {
  id: number;
  title: string;
  tag: string;
  tagColor: string;
  image: string;
};

type NewsListItem = {
  category: string;
  id: number;
  title: string;
  date: string;
  time: string;
};

const featuredNews = ref<FeaturedNewsItem[]>([
  {
    id: 1,
    title: '印志松赴地勘中心进行业务交流',
    tag: '企业动态',
    tagColor: '#3b82f6',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop',
  },
  {
    id: 2,
    title: '集团二季度绿色可持续发展报告发布',
    tag: '绿色发展',
    tagColor: '#22c55e',
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop',
  },
]);

const defaultFeatured: FeaturedNewsItem = {
  id: -1,
  title: '暂无要闻',
  tag: '企业动态',
  tagColor: '#3b82f6',
  image: newsImagePlaceholder,
};
const activeFeaturedIndex = ref(0);
const transitionDirection = ref<'next' | 'prev'>('next');
let featuredTimer: null | ReturnType<typeof setInterval> = null;

const newsList = ref<NewsListItem[]>([
  {
    category: '项目动态',
    id: 3,
    title: '蔡军恒到苏州中材花连山皖南、张换项目现场指导工作',
    date: '04-02',
    time: '09:16',
  },
  {
    category: '国际合作',
    id: 4,
    title: '朱凡出席尼日利亚·中国数字经贸合作论坛并发表主旨演讲',
    date: '04-02',
    time: '09:15',
  },
  {
    category: '经营管理',
    id: 5,
    title: '集团上半年经营分析会在京召开：稳中求进，质效双增',
    date: '04-02',
    time: '09:10',
  },
  {
    category: '通知公告',
    id: 6,
    title: '关于举办"2023科技创新周"系列学术讲座的通知',
    date: '04-01',
    time: '09:08',
  },
  {
    category: '荣誉奖项',
    id: 7,
    title: '我司荣获"年度行业数字化转型领军企业"大奖',
    date: '04-01',
    time: '09:05',
  },
]);

function handleFeaturedImgError(e: Event) {
  const el = e.target as HTMLImageElement;
  el.src = newsImagePlaceholder;
}
const activeFeatured = computed<FeaturedNewsItem>(() => {
  return (
    featuredNews.value[activeFeaturedIndex.value] ??
    featuredNews.value[0] ??
    defaultFeatured
  );
});

const newsListWrapRef = ref<HTMLElement | null>(null);
const visibleNewsCount = ref(5);
const overflowNewsTitleMap = ref<Record<number, boolean>>({});
let newsResizeObserver: ResizeObserver | null = null;

function updateVisibleNewsCount() {
  if (!newsListWrapRef.value) return;
  const h = newsListWrapRef.value.clientHeight;
  if (h <= 0) return;
  const total = newsList.value.length;
  const per = NEWS_ROW_HEIGHT + NEWS_ROW_GAP;
  const count = Math.floor((h + NEWS_ROW_GAP) / per);
  visibleNewsCount.value = Math.max(
    1,
    Math.min(count, total, MAX_VISIBLE_NEWS),
  );
}

function handleNewsTitleMouseEnter(event: MouseEvent, id: number) {
  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;
  overflowNewsTitleMap.value = {
    ...overflowNewsTitleMap.value,
    [id]: target.scrollWidth > target.clientWidth,
  };
}

function startFeaturedAutoPlay() {
  stopFeaturedAutoPlay();
  featuredTimer = setInterval(() => {
    handleNextFeatured();
  }, 3000);
}

function stopFeaturedAutoPlay() {
  if (featuredTimer) {
    clearInterval(featuredTimer);
    featuredTimer = null;
  }
}

function handlePrevFeatured() {
  const total = featuredNews.value.length;
  if (total <= 1) return;
  transitionDirection.value = 'prev';
  activeFeaturedIndex.value =
    (activeFeaturedIndex.value - 1 + total) % total;
}

function handleNextFeatured() {
  const total = featuredNews.value.length;
  if (total <= 1) return;
  transitionDirection.value = 'next';
  activeFeaturedIndex.value = (activeFeaturedIndex.value + 1) % total;
}

function handleViewAll() {
  message.info('跳转到E10系统的公司要闻列表页面');
}

function handleNewsClick(news: { title: string }) {
  message.info(`打开要闻：${news.title}`);
}

onMounted(() => {
  startFeaturedAutoPlay();
  // 根据可用高度动态决定右侧展示条数
  newsResizeObserver = new ResizeObserver(() => {
    updateVisibleNewsCount();
  });
  if (newsListWrapRef.value) {
    newsResizeObserver.observe(newsListWrapRef.value);
    updateVisibleNewsCount();
  }
});

onBeforeUnmount(() => {
  stopFeaturedAutoPlay();
  newsResizeObserver?.disconnect();
});
</script>

<template>
  <div class="flex h-full min-h-0 flex-col rounded-xl bg-white p-5">
    <div class="mb-4 flex shrink-0 items-center justify-between">
      <span class="text-base font-semibold text-gray-800">公司要闻</span>
      <Tooltip title="查看全部要闻">
        <UnorderedListOutlined
          class="cursor-pointer text-base text-gray-400 hover:text-blue-500"
          @click="handleViewAll"
        />
      </Tooltip>
    </div>

    <div class="min-h-0 flex-1">
      <div class="grid h-full min-h-0 grid-cols-10 gap-3">
        <div class="col-span-4 min-h-0">
          <div
            class="group relative h-full cursor-pointer overflow-hidden rounded-lg"
            @click="handleNewsClick(activeFeatured)"
            @mouseenter="stopFeaturedAutoPlay"
            @mouseleave="startFeaturedAutoPlay"
          >
            <Transition
              :name="
                transitionDirection === 'next'
                  ? 'featured-slide-next'
                  : 'featured-slide-prev'
              "
            >
              <div :key="activeFeatured.id" class="absolute inset-0">
                <img
                  :src="activeFeatured.image"
                  :alt="activeFeatured.title"
                  class="h-full w-full object-cover transition-transform group-hover:scale-105"
                  @error="handleFeaturedImgError"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent"
                ></div>
                <span
                  class="absolute left-2 top-2 rounded px-2 py-0.5 text-xs text-white"
                  :style="{ backgroundColor: activeFeatured.tagColor }"
                >
                  {{ activeFeatured.tag }}
                </span>
                <p
                  class="absolute bottom-2 left-2 right-9 line-clamp-2 text-sm leading-snug text-white"
                >
                  {{ activeFeatured.title }}
                </p>
              </div>
            </Transition>
            <div
              class="absolute inset-y-0 left-2 flex items-center"
            >
              <button
                class="flex size-8 items-center justify-center rounded-full bg-black/25 text-white/90 opacity-70 transition-all duration-200 hover:scale-110 hover:bg-black/55 hover:opacity-100 group-hover:scale-125 group-hover:bg-black/60 group-hover:text-white group-hover:opacity-100"
                type="button"
                @click.stop="handlePrevFeatured"
              >
                <LeftOutlined class="text-base group-hover:text-lg" />
              </button>
            </div>
            <div
              class="absolute inset-y-0 right-2 flex items-center"
            >
              <button
                class="flex size-8 items-center justify-center rounded-full bg-black/25 text-white/90 opacity-70 transition-all duration-200 hover:scale-110 hover:bg-black/55 hover:opacity-100 group-hover:scale-125 group-hover:bg-black/60 group-hover:text-white group-hover:opacity-100"
                type="button"
                @click.stop="handleNextFeatured"
              >
                <RightOutlined class="text-base group-hover:text-lg" />
              </button>
            </div>
          </div>
        </div>

        <div class="col-span-6 min-h-0 flex flex-col overflow-hidden pr-1">
          <div
            ref="newsListWrapRef"
            class="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden"
          >
            <div
              v-for="news in newsList.slice(0, visibleNewsCount)"
              :key="news.id"
              class="group flex h-8 cursor-pointer items-center justify-between text-sm"
              @click="handleNewsClick(news)"
            >
              <Tooltip
                :title="
                  overflowNewsTitleMap[news.id]
                    ? `[${news.category}] ${news.title}`
                    : null
                "
              >
                <span
                  class="mr-4 flex-1 truncate text-gray-700 transition-colors group-hover:text-blue-500"
                  @mouseenter="handleNewsTitleMouseEnter($event, news.id)"
                >
                  <span class="mr-1 text-gray-500">[{{ news.category }}]</span>
                  {{ news.title }}
                </span>
              </Tooltip>
              <span class="shrink-0 text-xs tabular-nums text-gray-400">
                {{ news.date }} {{ news.time }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.featured-slide-next-enter-active,
.featured-slide-next-leave-active,
.featured-slide-prev-enter-active,
.featured-slide-prev-leave-active {
  transition: transform 0.35s ease;
  position: absolute;
  inset: 0;
}

.featured-slide-next-enter-from {
  transform: translateX(100%);
}

.featured-slide-next-leave-to {
  transform: translateX(-100%);
}

.featured-slide-prev-enter-from {
  transform: translateX(-100%);
}

.featured-slide-prev-leave-to {
  transform: translateX(100%);
}
</style>
