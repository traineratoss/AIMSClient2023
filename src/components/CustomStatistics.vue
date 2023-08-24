<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { getStats } from "../services/statistics.service";
import generatedStatisticsToBeSend from "../utils/stats-transition-container";
import PieChart from "./PieChart.vue";
import RegisterView from "../views/RegisterView.vue";
import CustomLoader from "../components/CustomLoader.vue";

const props = defineProps({
  recievedFilteredStats: Object,
  showGenerated: Boolean,
  showSkeleton: Boolean,
  showAnimation: Boolean,
  showTopIdeas: Boolean,
});

const emits = defineEmits(["loadTop5Ideas", "loadData"]);

onMounted(async () => {
  calculateImplementationPercentage();
  showSkeleton.value = false;
  console.log(" din stats ", stats.value);
});

// do not touch this , do not touch !!! do not touch , whatever happens , do not touch under any circumstances !!!!
const stats = ref(props.recievedFilteredStats);

const sleepNow = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay));

const showSkeleton = ref(props.showSkeleton);
const implementationPercentage = ref(0);
const progressBar = ref(0);
const loadingSpeed = 10;

const showTopIdeas = ref(false);

watch(progressBar, (newX) => {
  progressBar.value = newX;
});

watch(
  () => props.showTopIdeas,
  (newValue) => {
    showTopIdeas.value = newValue;
  }
);

watch(() => props.showAnimation, (newValue) => {
  console.log(newValue)
})
async function calculateImplementationPercentage() {
  if (props.recievedFilteredStats.nrOfIdeas > 0) {
    implementationPercentage.value = Math.round(
      (props.recievedFilteredStats.implementedIdeas /
        (props.recievedFilteredStats.openIdeas +
          props.recievedFilteredStats.implementedIdeas)) *
      100
    );
  } else {
    implementationPercentage.value = 0;
  }

  for (let i = 0; i < implementationPercentage.value; i++) {
    await sleepNow((loadingSpeed * 100) / implementationPercentage.value);
    progressBar.value++;
  }
}

function loadTop5Ideas() {
  console.log(
    "Top 5 ideas >> ",
    props.recievedFilteredStats.mostCommentedIdeas
  );

  emits("loadTop5Ideas", props.recievedFilteredStats.mostCommentedIdeas);
}

async function refreshStats() {
  showSkeleton.value = true;

  setTimeout(async () => {
    stats.value = await getStats();
    showSkeleton.value = false;
  }, "100");
}

function loadData() {
  emits("loadData");
}

function getShortenedTitle(title, maxLength) {
  return title.length > maxLength ? title.substr(0, maxLength) + "..." : title;
}
</script>

<template>
  <transition name="skeleton-fade">
    <div v-if="showSkeleton" class="skeleton-loader">
      <div class="loader"></div>
    </div>
  </transition>

  <transition name="stats-fade">
    <div class="stats-wrapper" v-if="!showSkeleton">
      <div v-if="props.showAnimation" style="display: flex; align-items: center; justify-content: center;">
        <div class="loader" style="margin-top: 30vh;">
          <CustomLoader :size="60" />
        </div>
      </div>
      <div class="general-statistics" v-if="props.showGenerated && !props.showAnimation">
        <div class="stats-container">
          <div class="stat-item" style="margin-top: 30px">
            <p class="stat-label"><b>Total Ideas:</b></p>
            <b>{{ stats.nrOfIdeas }}</b>
          </div>
          <div class="stat-item">
            <p class="stat-label"><b>Public Ideas:</b></p>
            <b>{{ stats.openIdeas + stats.implementedIdeas }}</b>
          </div>
          <div class="stat-item">
            <p>
              Our current implementation status is
              <strong>{{ implementationPercentage }}%</strong>
            </p>
          </div>
          <div class="stat-item">
            <br />
            <div class="implementation-bar">
              <div class="fill" :style="{ width: progressBar + '%' }"></div>
            </div>
          </div>

          <div class="piechart">
            <pie-chart :sizeInVW="10" :speedInMS="loadingSpeed" :openP="stats.openP" :implP="stats.implP"
              :draftP="stats.draftP" :colorOpen="'#fadebc'" :colorImpl="'#ffb55a'" :colorDraft="'#b3b3b3'"
              :backgroundColor="'#b3b3b3'" :openIdeasNumber="stats.openIdeas"
              :implementedIdeasNumber="stats.implementedIdeas" :draftIdeasNumber="stats.draftIdeas" />
          </div>
          <div v-if="props.recievedFilteredStats.mostCommentedIdeas.length !== 0" class="most-commented-ideas">
            <p>Top most commented ideas:</p>
            <table id="idea-table">
              <tr>
                <th>Idea title</th>
                <th>No. of comments</th>
              </tr>
              <tr>
                <td>
                  {{ getShortenedTitle(stats.mostCommentedIdeas[0].title, 20) }}
                </td>
                <td>{{ stats.mostCommentedIdeas[0].commentsNumber }}</td>
              </tr>
              <tr>
                <td>
                  {{ getShortenedTitle(stats.mostCommentedIdeas[1].title, 20) }}
                </td>
                <td>{{ stats.mostCommentedIdeas[1].commentsNumber }}</td>
              </tr>
              <tr>
                <td>
                  {{ getShortenedTitle(stats.mostCommentedIdeas[2].title, 20) }}
                </td>
                <td>{{ stats.mostCommentedIdeas[2].commentsNumber }}</td>
              </tr>
              <tr>
                <td>
                  {{ getShortenedTitle(stats.mostCommentedIdeas[3].title, 20) }}
                </td>
                <td>{{ stats.mostCommentedIdeas[3].commentsNumber }}</td>
              </tr>
              <tr>
                <td>
                  {{ getShortenedTitle(stats.mostCommentedIdeas[4].title, 20) }}
                </td>
                <td>{{ stats.mostCommentedIdeas[4].commentsNumber }}</td>
              </tr>
            </table>
            <div class="swich-buttons">
              <button class="load-button" @click="loadTop5Ideas()">
                {{ !showTopIdeas ? "Load top commented ideas" : "Load all Ideas" }}
              </button>

              <!-- <button class="load-button" @click="refreshStats()">
                Refresh
              </button> -->
            </div>
          </div>
          <div v-if="props.recievedFilteredStats.mostCommentedIdeas.length === 0" class="most-commented-ideas">
            <p>Top Most commented ideas:</p>
            <h4>No comments were posted in this time interval</h4>
          </div>
          <div class="most-commented-ideas" style="margin-bottom: 50px">
            <p>General information:</p>
            <table id="idea-table">
              <tr>
                <td>Number of Users:</td>
                <td>{{ stats.nrOfUsers }}</td>
              </tr>
              <tr>
                <td>Ideas per User:</td>
                <td>{{ stats.ideasPerUser }}</td>
              </tr>
              <tr>
                <td>Total no. of Comments:</td>
                <td>{{ stats.totalNrOfComments }}</td>
              </tr>
              <tr>
                <td>Total no. of Replies:</td>
                <td>{{ stats.totalNrOfReplies }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <div class="general-statistics" v-if="!props.showGenerated && !props.showAnimation">
        <div class="stats-container">
          <div class="stat-item" style="margin-top: 30px">
            <p class="stat-label">
              <b>Total Ideas in selected time interval:</b>
            </p>
            <b>{{ props.recievedFilteredStats.nrOfIdeas }}</b>
          </div>
          <div class="stat-item">
            <p class="stat-label"><b>Public Ideas:</b></p>
            <b>{{
              props.recievedFilteredStats.openIdeas +
              props.recievedFilteredStats.implementedIdeas
            }}</b>
          </div>
          <div class="piechart">
            <Suspense>
              <pie-chart :sizeInVW="10" :speedInMS="loadingSpeed" :openP="props.recievedFilteredStats.openP"
                :implP="props.recievedFilteredStats.implP" :draftP="props.recievedFilteredStats.draftP"
                :colorOpen="'#fadebc'" :colorImpl="'#ffb55a'" :colorDraft="'#b3b3b3'" :backgroundColor="'#b3b3b3'"
                :openIdeasNumber="props.recievedFilteredStats.openIdeas" :implementedIdeasNumber="props.recievedFilteredStats.implementedIdeas
                  " :draftIdeasNumber="props.recievedFilteredStats.draftIdeas" />
              <template #fallback> Loading... </template>
            </Suspense>
          </div>
          <div v-if="props.recievedFilteredStats.mostCommentedIdeas.length !== 0" class="most-commented-ideas">
            <p>Top Most commented ideas :</p>
            <table id="idea-table">
              <tr>
                <th>Idea title</th>
                <th>No. of comments</th>
              </tr>
              <tr v-if="props.recievedFilteredStats.mostCommentedIdeas[0]">
                <td>
                  {{
                    getShortenedTitle(
                      props.recievedFilteredStats.mostCommentedIdeas[0].title,
                      20
                    )
                  }}
                </td>
                <td>
                  {{
                    props.recievedFilteredStats.mostCommentedIdeas[0]
                      .commentsNumber
                  }}
                </td>
              </tr>
              <tr v-if="props.recievedFilteredStats.mostCommentedIdeas[1]">
                <td>
                  {{
                    getShortenedTitle(
                      props.recievedFilteredStats.mostCommentedIdeas[1].title,
                      20
                    )
                  }}
                </td>
                <td>
                  {{
                    props.recievedFilteredStats.mostCommentedIdeas[1]
                      .commentsNumber
                  }}
                </td>
              </tr>
              <tr v-if="props.recievedFilteredStats.mostCommentedIdeas[2]">
                <td>
                  {{
                    getShortenedTitle(
                      props.recievedFilteredStats.mostCommentedIdeas[2].title,
                      20
                    )
                  }}
                </td>
                <td>
                  {{
                    props.recievedFilteredStats.mostCommentedIdeas[2]
                      .commentsNumber
                  }}
                </td>
              </tr>
              <tr v-if="props.recievedFilteredStats.mostCommentedIdeas[3]">
                <td>
                  {{
                    getShortenedTitle(
                      props.recievedFilteredStats.mostCommentedIdeas[3].title,
                      20
                    )
                  }}
                </td>
                <td>
                  {{
                    props.recievedFilteredStats.mostCommentedIdeas[3]
                      .commentsNumber
                  }}
                </td>
              </tr>
              <tr v-if="props.recievedFilteredStats.mostCommentedIdeas[4]">
                <td>
                  {{
                    getShortenedTitle(
                      props.recievedFilteredStats.mostCommentedIdeas[4].title,
                      20
                    )
                  }}
                </td>
                <td>
                  {{
                    props.recievedFilteredStats.mostCommentedIdeas[4]
                      .commentsNumber
                  }}
                </td>
              </tr>
            </table>
            <div class="swich-buttons">
              <button class="load-button" @click="loadTop5Ideas()">
                {{ !showTopIdeas ? "Load top ideas" : "Load all Ideas" }}
              </button>
              <!-- <button class="load-button" @click="loadData()">
                Reload ideas
              </button> -->

              <!-- Uncomment only if you implement it right -->
              <!-- <button class="load-button" @click="refreshStats()">
                Refresh 
              </button> -->
            </div>
          </div>
          <div v-if="props.recievedFilteredStats.mostCommentedIdeas.length === 0" class="most-commented-ideas">
            <p>Top Most commented ideas:</p>
            <h4>No comments were posted in this time interval</h4>
          </div>
          <div class="most-commented-ideas" style="margin-bottom: 50px">
            <p>General information for the selected time interval:</p>
            <table id="idea-table">
              <tr>
                <td>Total no. of Comments:</td>
                <td>{{ props.recievedFilteredStats.totalNrOfComments }}</td>
              </tr>
              <tr>
                <td>Total no. of Replies:</td>
                <td>{{ props.recievedFilteredStats.totalNrOfReplies }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.swich-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 15px;
}

.load-button {
  margin-top: 20px;
  border: 1px solid black;
  background-color: white;
  height: 30px;
  text-align: center;
  width: 10vw;
  border-radius: 3px;
  cursor: pointer;
}

.load-button:hover {
  /* color: #ffa941;
  border: 1px solid #ffa941; */
  background-color: #ffa941;
  font-weight: bold;
}

.most-commented-ideas {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-top: 20px;
}

#idea-table {
  margin-top: 10px;
  table-layout: fixed;
  border-collapse: collapse;
  border: 1px solid slategray;
  text-align: center;
  width: 18vw;
  min-height: 10vh;
}

th {
  border-bottom: 1px solid slategray;
  font-size: 16px;
  padding: 5px;
}

td {
  font-size: 15px;
  padding: 2px;
  border-bottom: 1px solid slategray;
}

strong {
  font-size: 17px;
}

.stats-fade-enter-active {
  opacity: 0.3;
  transition: opacity 0.7s;
}

.stats-fade-enter-to {
  opacity: 1;
}

.skeleton-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 91vh;
  background-color: #b3b3b3;
  box-sizing: content-box;
  padding-top: 10px;
  width: 20vw;
}

.skeleton-loader .loader {
  width: 100%;
  height: 93vh;
  background-color: #f2f2f2;
  background-image: linear-gradient(90deg,
      #f5f5f5 25%,
      #e6e6e6 37%,
      #f6f4f4 63%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s infinite linear;
}

@keyframes skeleton-pulse {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

.stats-wrapper {
  background-color: white;
  box-sizing: content-box;
  padding-top: 10px;
  width: 20vw;
}

.stats-container {
  text-align: center;
  height: 70vh;
  overflow: auto;
  margin-bottom: 15vh;
}

.stats-container::-webkit-scrollbar {
  display: block;
  width: 10px;
}

.stats-container:hover::-webkit-scrollbar {
  display: block;
  width: 10px;
}

.stats-container::-webkit-scrollbar-thumb {
  background-color: #ffa941;
  border-radius: 5px;
  border: 1px solid slategray;
}

.fill {
  height: 100%;
  background-color: #ffa941;
  transition: width 0.3s ease;
}

.implementation-bar {
  width: 75%;
  height: 20px;
  background-color: #fff;
  border: 1px solid slategray;
  margin: 0 auto;
  border-radius: 7.5px;
  overflow: hidden;
}

.material-symbols-outlined {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 10px;
}
</style>
