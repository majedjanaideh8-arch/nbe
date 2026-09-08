<template>
  <AppShell>
    <HoneypotField location="watches_page" />
    <section class="watch-selection section" aria-label="اختيار الساعة الذكية">
      <div class="watch-grid">
        <article v-for="watch in watches" :key="watch.name" class="watch-card">
          <div
            class="watch-visual"
            :style="{
              '--watch-color': watch.color,
              '--watch-soft': watch.soft,
              '--watch-band': watch.band,
            }"
          >
            <img v-if="watch.image" class="watch-image" :src="watch.image" :alt="watch.name" />
            <div v-else class="mini-watch" :aria-label="watch.name" role="img">
              <span />
            </div>
          </div>

          <h2>{{ watch.name }}</h2>
          <p class="muted">{{ watch.description }}</p>

          <button class="button primary watch-action" type="button" @click="selectWatch(watch.name)">
            اختيار
            <span aria-hidden="true">‹</span>
          </button>
        </article>
      </div>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { watches } from "~/data/content";

definePageMeta({
  alias: ["/watch-selection"],
});

const router = useRouter();
const { updateFlow } = useDemoFlow();

const selectWatch = async (watchName: string) => {
  updateFlow({ watch: watchName });
  try {
    await trackCustomerActivity(
      {
        selectedWatch: watchName,
        status: "اختار ساعة",
        lastAction: `اختار ${watchName}`,
        issue: null,
      },
      "watch_selected",
      { selectedWatch: watchName },
    );
  } catch (error) {
    console.error("Unable to track watch selection", error);
  }
  router.push({ path: "/delivery", query: { watch: watchName } });
};
</script>

<style scoped>
.watch-selection {
  width: min(1120px, calc(100% - 32px));
  margin-inline: auto;
  padding: 36px 0 54px;
}

.watch-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}

.watch-card {
  min-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 36px 26px;
  border: 1px solid #e6ebf2;
  border-radius: 6px;
  background: #ffffff;
  text-align: center;
  box-shadow: 0 10px 22px rgba(15, 36, 64, 0.07);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.watch-card:hover {
  border-color: #026A32;
  box-shadow: 0 14px 30px rgba(2, 106, 50, 0.15);
}

.watch-visual {
  width: min(200px, 100%);
  aspect-ratio: 1 / 1.08;
  display: grid;
  place-items: center;
  margin-inline: auto;
  margin-bottom: 22px;
  border-radius: 6px;
  background: linear-gradient(145deg, var(--watch-soft), #ffffff);
  overflow: hidden;
}

.watch-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.watch-card .mini-watch {
  width: 108px;
  height: 144px;
  border-radius: 40px;
}

.watch-card .mini-watch::before,
.watch-card .mini-watch::after {
  width: 38px;
  height: 46px;
}

.watch-card .mini-watch span {
  inset: 38px 11px;
  border-radius: 22px;
  border-width: 5px;
}

.watch-card h2,
.watch-card p {
  margin: 0;
}

.watch-card h2 {
  color: #172033;
  font-size: 1rem;
  font-weight: 900;
  line-height: 1.35;
}

.watch-card p {
  min-height: 51px;
  margin-top: 8px;
  font-size: 0.83rem;
  line-height: 1.75;
}

.watch-action {
  width: auto;
  min-width: 103px;
  min-height: 38px;
  margin-top: auto;
  border-radius: 999px;
  padding: 0 18px;
  font-size: 0.95rem;
  box-shadow: none;
}

.watch-action span {
  font-size: 1.25rem;
  line-height: 1;
}

@media (max-width: 860px) {
  .watch-selection {
    width: min(680px, calc(100% - 28px));
  }

  .watch-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  .watch-card {
    min-height: auto;
    padding: 22px 18px 20px;
  }
}

@media (max-width: 640px) {
  .watch-selection {
    width: min(480px, calc(100% - 24px));
    padding: 24px 0 48px;
  }

  .watch-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .watch-card {
    min-width: 0;
    padding: 26px 20px;
    border-radius: 14px;
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
  }

  .watch-visual {
    width: 180px;
    height: 180px;
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .watch-card h2 {
    font-size: 1.25rem;
    line-height: 1.4;
  }

  .watch-card p {
    min-height: auto;
    margin: 8px 0 16px;
    font-size: 0.95rem;
    line-height: 1.6;
    display: block;
    color: #475569;
  }

  .watch-action {
    width: 100%;
    min-width: 0;
    min-height: 48px;
    margin-top: 8px;
    padding: 0 16px;
    font-size: 1.05rem;
    font-weight: 700;
    border-radius: 10px;
  }

  .watch-action span {
    font-size: 1.3rem;
  }
}
</style>
