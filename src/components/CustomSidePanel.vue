<script setup>
import { onMounted, ref, watch } from "vue";
import CustomDropDown from "../components/CustomDropDown.vue";
import CustomInput from "./CustomInput.vue";
import { getCategory, getUser } from "../services/idea.service";
import { filterIdeas } from "../services/idea.service";
import { defineEmits } from "vue";
import generatedStatisticsToBeSend from "../utils/stats-transition-container";
import searchValue from "../utils/search-title";
import { onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";

window.addEventListener("keydown", handleGlobalKeyDown);

const route = useRoute();

const props = defineProps({
  sort: Number,
  currentPage: Number,
  ideasPerPage: Number,
  currentUser: String,
  hideUser: Boolean,
  clearAll: Boolean,
});

const categoryOptions = ref([]);
const categoriesSelected = ref([]);
const userOptions = ref([]);
const userSelected = ref([]);
const statusSelected = ref([]);
const inputTitle = ref("");
const inputText = ref("");
const selectedDateFrom = ref("");
const selectedDateTo = ref("");
const sortOrder = ref("ASC");
const filteredIdeasEmit = ref({});

const clearAllDropdownValues = ref(false);

const statusPercentage = ref("10%");
const categoryPercentage = ref("10%");
const userPercentage = ref("10%");

const stars = ref(null);
const ratingSet = ref({
  isSet: false,
  ratingNumber: 0,
});

const statusOptions =
  props.currentUser === null
    ? ["OPEN", "IMPLEMENTED"]
    : ["OPEN", "DRAFT", "IMPLEMENTED"];

const emits = defineEmits([
  "filter-listening",
  "pass-input-variables",
  "generatedStatistics",
]);

watch(
  () => props.clearAll,
  (newValue) => {
    if (newValue) {
      clearSelection();
    }
  }
);

watch(
  [
    inputTitle,
    inputText,
    statusSelected,
    categoriesSelected,
    userSelected,
    ratingSet.value.ratingNumber,
    selectedDateFrom,
    selectedDateTo,
  ],
  ([
    newInputTitle,
    newInputText,
    newStatusSelected,
    newCategoriesSelected,
    newUserSelected,
    newRatingSelected,
    newSelectedDateFrom,
    newSelectedDateTo,
  ]) => {
    emits(
      "pass-input-variables",
      newInputTitle,
      newInputText,
      newStatusSelected,
      newCategoriesSelected,
      newUserSelected,
      newRatingSelected,
      newSelectedDateFrom,
      newSelectedDateTo
    );
  }
);

watch(searchValue, (newValue) => {
  if (newValue && newValue.text !== undefined) {
    inputTitle.value = newValue.text;
  }
});

//when pressing anywhere on the page the Enter key, we will filter
function handleGlobalKeyDown(event) {
  if (event.key === "Enter") {
    filterData();
  }
}

const filterData = async () => {
  await filter();
  emits("filter-listening", filteredIdeasEmit.value);
};

async function handleSelectedCategories(selectedCategories) {
  categoriesSelected.value = selectedCategories;
}

async function handleSelectedUsers(selectedUsers) {
  userSelected.value = selectedUsers;
}
async function handleSelectedStatus(selectedStatus) {
  statusSelected.value = selectedStatus;
}

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleGlobalKeyDown);
});

onMounted(async () => {
  if (searchValue && searchValue.value && searchValue.value.text) {
    inputTitle.value = searchValue.value.text; // each time we mount a view, we set the title to be the one from the search bar
    // so they wont be different
  } else {
    inputTitle.value = "";
  }
  const dataCategory = await getCategory();
  const categoryNames = dataCategory.map((category) => category.text);
  categoryOptions.value = categoryNames;

  const dataUser = await getUser(100, 0, "username");
  const usernames = dataUser.map((user) => user.username);
  userOptions.value = usernames;
  sortOrder.value = "ASC";
});

watch(ratingSet, async (newValue) => {
  if (!newValue.isSet) {
    ratingSet.value.ratingNumber = null;
  }
}, { deep: true })

const filter = async () => {
  const title = inputTitle.value;
  const text = inputText.value;
  const category = categoriesSelected.value;
  const dateFrom = selectedDateFrom.value;
  const dateTo = selectedDateTo.value;
  const user = userSelected.value;
  const status = statusSelected.value;

  let ratingNumber = null;
  if (ratingSet.value.isSet) {
    ratingNumber = ratingSet.value.ratingNumber;
  }

  const filteredIdeas = await filterIdeas(
    title,
    text,
    status,
    category,
    user,
    ratingSet.value.ratingNumber,
    dateFrom,
    dateTo,
    props.currentPage - 1,
    props.ideasPerPage,
    props.currentUser,
    props.sort
  );

  console.log(filteredIdeas);

  if (filteredIdeas === "No ideas found.") {
    filteredIdeasEmit.value = {
      content: [],
      totalPages: 0,
      totalElements: 0,
    };
  } else {
    filteredIdeasEmit.value = filteredIdeas;
    console.log(filteredIdeasEmit.value);
  }
};

// clearing all when pressing the clear button
function clearSelection() {
  searchValue.value = {
    text: "",
    key: "",
  };
  inputTitle.value = "";
  inputText.value = "";
  selectedDateFrom.value = "";
  selectedDateTo.value = "";
  categoriesSelected.value = [];
  userSelected.value = [];
  statusSelected.value = [];
  clearAllDropdownValues.value = true;
  setTimeout(() => {
    clearAllDropdownValues.value = false;
  }, 10);
  ratingSet.value.isSet = false;
  ratingSet.value.ratingNumber = 0;
  stars.value = document.querySelectorAll(".star");
  stars.value.forEach((star, index) => {
      star.style.backgroundPosition = "left -0.2vh";
  });
}

function displaySelection(categoriesList) {
  let finalList = "";

  if (categoriesList.length === 1) {
    finalList += categoriesList;

    return finalList;
  }

  for (let category of categoriesList) {
    if (categoriesList.indexOf(category) === categoriesList.length - 1)
      finalList += category;
    else finalList += category + ", ";
  }

  return finalList;
}

function setPosition(componentId, overlayId) {
  const component = document.getElementById(componentId);
  const overlay = document.getElementById(overlayId);

  if (component && overlay) {
    const componentCoords = component.getBoundingClientRect();
    const x = componentCoords.left;
    const y = componentCoords.top;

    overlay.style.marginTop = y + 30 + "px";
    overlay.style.marginLeft = x + "px";
  }
}

watch(categoriesSelected, () => {
  if (categoriesSelected.value.length === 1 && userSelected.value.length === 0)
    setPosition("categorySelect", "displayCategories");
  else if (
    categoriesSelected.value.length === 1 &&
    userSelected.value.length > 0
  ) {
    setPosition("categorySelect", "displayCategories");
    setTimeout(() => {
      setPosition("userSelect", "displayUsers");
    }, "10");
  } else if (
    categoriesSelected.value.length === 0 &&
    userSelected.value.length > 0
  ) {
    setTimeout(() => {
      setPosition("userSelect", "displayUsers");
    }, "10");
  }
});

watch(statusSelected, () => {
  if (
    statusSelected.value.length === 1 &&
    categoriesSelected.value.length === 0
  )
    setPosition("statusSelect", "displayStatuses");
  else if (
    statusSelected.value.length === 1 &&
    categoriesSelected.value.length > 0
  ) {
    setPosition("statusSelect", "displayStatuses");
    setTimeout(() => {
      setPosition("categorySelect", "displayCategories");
    }, "10");
  } else if (
    statusSelected.value.length === 0 &&
    categoriesSelected.value.length > 0
  ) {
    setTimeout(() => {
      setPosition("categorySelect", "displayCategories");
    }, "10");
  }

  if (statusSelected.value.length === 1 && userSelected.value.length > 0) {
    setPosition("statusSelect", "displayStatuses");
    setTimeout(() => {
      setPosition("userSelect", "displayUsers");
    }, "10");
  } else if (
    statusSelected.value.length === 0 &&
    userSelected.value.length > 0
  ) {
    setTimeout(() => {
      setPosition("userSelect", "displayUsers");
    }, "10");
  }
});

watch(userSelected, () => {
  if (userSelected.value.length === 1) {
    setPosition("userSelect", "displayUsers");
  }
});

function removeSelection(selectionType, index) {
  const indexValue = index;
  console.log(selectionType);
  switch (selectionType) {
    case "statusType":
      statusSelected.value = statusSelected.value.filter(
        (status, index) => indexValue !== index
      );
      break;
    case "categoryType":
      categoriesSelected.value = categoriesSelected.value.filter(
        (category, index) => indexValue !== index
      );
      break;
    case "userType":
      userSelected.value = userSelected.value.filter(
        (user, index) => indexValue !== index
      );
      break;
  }
}

function stringifyOptions(option) {
  switch (option) {
    case "status":
      return JSON.stringify(statusSelected.value);
    case "category":
      return JSON.stringify(categoriesSelected.value);
    case "user":
      return JSON.stringify(userSelected.value);
  }
}

function topContainerGridPercentages() {
  if (
    statusSelected.value.length > 0 &&
    categoriesSelected.value.length === 0 &&
    userSelected.value.length === 0
  ) {
    return "top-container-status-activated";
  }
  if (
    statusSelected.value.length === 0 &&
    categoriesSelected.value.length > 0 &&
    userSelected.value.length === 0
  ) {
    return "top-container-category-activated";
  }
  if (
    statusSelected.value.length === 0 &&
    categoriesSelected.value.length === 0 &&
    userSelected.value.length > 0
  ) {
    return "top-container-user-activated";
  }
  if (
    statusSelected.value.length > 0 &&
    categoriesSelected.value.length > 0 &&
    userSelected.value.length === 0
  ) {
    return "top-container-status-and-category-activated";
  }
  if (
    statusSelected.value.length > 0 &&
    categoriesSelected.value.length === 0 &&
    userSelected.value.length > 0
  ) {
    return "top-container-status-and-user-activated";
  }
  if (
    statusSelected.value.length === 0 &&
    categoriesSelected.value.length > 0 &&
    userSelected.value.length > 0
  ) {
    return "top-container-user-and-category-activated";
  }
  if (
    statusSelected.value.length > 0 &&
    categoriesSelected.value.length > 0 &&
    userSelected.value.length > 0
  ) {
    return "top-container-user-and-status-and-category-activated";
  } else {
    return "top-container";
  }
}

function starsEventListener(indexValue) {
  // First, we have a condition, if the rating is set by click
  // If not, we add event listeners on each star so we know when being on each other
  // We calculate the amount of stars we should have
  // If we clicked a star, it means we already set a rating and it goes into the else statement
  // there, if we go on on another star, it will reset the rating and we can put another rating
  if (!ratingSet.value.isSet) {
    stars.value = document.querySelectorAll(".star");
    stars.value.forEach((star, index) => {
      star.addEventListener("mouseenter", () => {
        if (index == 0 && !ratingSet.value.isSet) {
          star.style.backgroundPosition = "left -8.8vh";
        } else if (!ratingSet.value.isSet) {
          let number = index;
          while (number >= 0) {
            stars.value[number].style.backgroundPosition = "left -8.8vh";
            number--;
          }
        }
      });

      star.addEventListener("mouseleave", () => {
        if (index == 0 && !ratingSet.value.isSet) {
          star.style.backgroundPosition = "left -0.2vh";
        } else if (!ratingSet.value.isSet) {
          let number = index;
          while (number >= 0) {
            stars.value[number].style.backgroundPosition = "left -0.2vh";
            number--;
          }
        }
      });
    });
  } else {
    stars.value = document.querySelectorAll(".star");
    if (indexValue !== ratingSet.value.ratingNumber) {
      stars.value.forEach((star, index) => {
        if (index < indexValue) {
          star.style.backgroundPosition = "left -8.8vh";
        } else {
          star.style.backgroundPosition = "left -0.2vh";
        }
      });
      ratingSet.value.isSet = false;
    }
  }
}

let oneTimer = true;
function onMountStars() {
  if (oneTimer && !ratingSet.value.isSet) {
    starsEventListener();
    oneTimer = false;
  } else {
    oneTimer = false;
  }
}


async function setRating(indexValue) {
  stars.value = document.querySelectorAll(".star");
  ratingSet.value.isSet = true;
  ratingSet.value.ratingNumber = indexValue;

  stars.value.forEach((star, index) => {
    if (index < indexValue) {
      star.style.backgroundPosition = "left -8.8vh";
    }
  });

  await addRatingToIdea(
    ideaId,
    ratingSet.value.ratingNumber,
    getCurrentUsername()
  );
}

</script>

<template>
  <div class="side-panel-container">
    <div :class="topContainerGridPercentages()">
      <div class="top-container-child">
        <span class="filter-by">Filter By:</span>

        <button id="clear-all-button" @click="clearSelection()">
          Clear all
        </button>
      </div>

      <div class="top-container-child">
        <span class="title"> Title: </span>
        <CustomInput v-model="inputTitle" :placeholder="`Write a title...`" :can-modify-search-value="true"
          :widthInPx="13" :height-in-px="2.5" :style="{ 'background-color': 'white', 'font-weight': '370' }" />
      </div>

      <div class="top-container-child">
        <span class="text">Text:</span>
        <CustomInput v-model="inputText" class="text-input" :placeholder="`Write a text...`"
          :can-modify-search-value="false" :widthInPx="13" :height-in-px="2.5"
          :style="{ 'background-color': 'white', 'font-weight': '370' }" />
      </div>

      <div class="top-container-child">
        <span :class="statusSelected.length > 0 ? 'status2' : 'status'">Status:</span>

        <div class="top-container-child-dropdown">
          <CustomDropDown :variants="statusOptions" @update:selectedOptions="handleSelectedStatus"
            :canAddInDropdown="false" :input-placeholder="`Select your statuses...`" :clear-all="clearAllDropdownValues"
            :width-in-vw="13" :height-in-vh="5" :selectedObjects="stringifyOptions('status')">
          </CustomDropDown>

          <div class="display-container">
            <div class="display-items-container" v-for="(status, index) in statusSelected" :key="index"
              @click="removeSelection('statusType', index)">
              {{ status }} <b>x</b>
            </div>
          </div>
        </div>
      </div>

      <div class="top-container-child">
        <span :class="categoriesSelected.length > 0 ? 'category2' : 'category'">Category:</span>

        <div class="top-container-child-dropdown">
          <CustomDropDown :variants="categoryOptions" @update:selectedOptions="handleSelectedCategories"
            :canAddInDropdown="false" :input-placeholder="`Select your categories...`" :clear-all="clearAllDropdownValues"
            :width-in-vw="13" :height-in-vh="5" :selectedObjects="stringifyOptions('category')">
          </CustomDropDown>

          <div class="display-container">
            <div class="display-items-container" v-for="(category, index) in categoriesSelected" :key="index"
              @click="removeSelection('categoryType', index)">
              {{ category }} <b>x</b>
            </div>
          </div>
        </div>
      </div>

      <div class="top-container-child">
        <span :class="userSelected.length > 0 ? 'user2' : 'user'"
          :style="{ visibility: hideUser ? 'hidden' : 'visible' }">User:</span>

        <div class="top-container-child-dropdown">
          <CustomDropDown :style="{ visibility: hideUser ? 'hidden' : 'visible' }" :variants="userOptions"
            @update:selectedOptions="handleSelectedUsers" :canAddInDropdown="false"
            :input-placeholder="`Select your users...`" :clear-all="clearAllDropdownValues" :width-in-vw="13"
            :height-in-vh="5" :selectedObjects="stringifyOptions('user')">
          </CustomDropDown>

          <div class="display-container">
            <div class="display-items-container" v-for="(user, index) in userSelected" :key="index"
              @click="removeSelection('userType', index)">
              {{ user }} <b>x</b>
            </div>
          </div>
        </div>
      </div>

      <div class="top-container-child">
        <span :class="statusSelected.length > 0 ? 'status2' : 'status'">Rating:</span>
        <div class="rating" style="overflow: hidden" @mouseenter="onMountStars()">
          <i class="star" @click="setRating(1)" @mouseenter="starsEventListener(1), ratingSet.ratingNumber = 1"
            @mouseleave="leaveStar(1)"></i>
          <i class="star" @click="setRating(2)" @mouseenter="starsEventListener(2), ratingSet.ratingNumber = 2"
            @mouseleave="leaveStar(2)"></i>
          <i class="star" @click="setRating(3)" @mouseenter="starsEventListener(3), ratingSet.ratingNumber = 3"
            @mouseleave="leaveStar(3)"></i>
          <i class="star" @click="setRating(4)" @mouseenter="starsEventListener(4), ratingSet.ratingNumber = 4"
            @mouseleave="leaveStar(4)"></i>
          <i class="star" @click="setRating(5)" @mouseenter="starsEventListener(5), ratingSet.ratingNumber = 5"
            @mouseleave="leaveStar(5)"></i>
        </div>
      </div>
    </div>
    <div class="low-container">
      <div class="date-chooser">
        <fieldset class="select-date" style="border: 1px solid slategray">
          <legend style="margin-left: 1em; padding: 0.2em 3em">
            Select Creation Date Interval
          </legend>
          <div class="date-input">
            <div>
              <span class="from-date"> From: </span>
              <CustomInput v-model="selectedDateFrom" type="date" class="date-picker" />
            </div>
            <div>
              <span class="to-date"> To: </span>
              <CustomInput v-model="selectedDateTo" type="date" class="date-picker" />
            </div>
          </div>
        </fieldset>
      </div>

      <div id="filter-buttons">
        <button id="filter-button" @click="filterData">Filter</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.star {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAABQCAYAAAAZQFV3AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABOFJREFUeNrsmEFoHFUYx9/MdHfTJRKzUhBaFiL1YghZCFQUIV6UQJuLWCgr8eKpIoiFSqsHQYrmYj14KHqxKAl6MbA5eCgKRVAMBhpCwIJQCETRQzTsNtnO7s74+17fbGc3M7OzZhUsHfjzdvd97/++973vff99Y/m+rwb5WL0Idz60h2nckTc8Nw2hncLmAnhtIB7i3VGan8VD8Dhebh+U8FOaX8Bh4EB48R8TQlai+QnkgMTxD/AYpFt9EULk0EyBD8Dn4BPT9TZ4CrwD6Wos4V+XrUdpXzQk4tUEkAFXwNUu+1fAWWO7anADLDLJTkCYpf0K3DQe3Ui5oUI6B8ShlyBstZfMMiXoX4MV8GZKQgnJcXA6nKPtGJoE/gZ8Cy6mIJPwnIJsL3ZTIB2h+U6WANZjyE6Aj8Cz3WT7TooJ7HUwneDdc+BaFFnc0SuCzQTCTWOT+iwfN6cjWJ6clo9NzOS5Bcb6IZTZj5pU+syEYNV8XzA2Y6lOCptyhGbDeDFPnJa6TlGZ5rxJ/nxkSRPCACR5EUyHf4sCNjOgENVn/ecVe+CEy8vLWgJmZ2fd1IRra2vxSbe5eYlmu1gsXo6zmZycTKcpkEn6vC61kM+FQYiUeDdvauP5Ay0ZjyIlgKVv9bVkiBwQVJRX2YwWkKLxrhxB+qYSPaxUKrESANHVrh2PlQAzqSbskAA6UkkA5B0SICvRSzb5ddrMWu4jh8umSLwckLVjSKClWJ6SwsrM76fwLpCAM4x1I9OGjhrN8+AkAyYSyGTDnhEHjCPxeYhBagmIIvtXJOBQkgSY5Z01/76umAy4lbpiG5IqzQuG6Alz9LLmf+IP5hh+AfmxnoSQdUgAg5a6JuuQgMiSFi7fJHkR9JQAbGbA/SoBi4uLWgLK5XIqCdBpkyQBZne3sTm4BGxsbLQlgM+DkYBsNjucyWQKaSXATvCuZFnWHIQqlxMVUOeMx/0RMsgBWgIgcyBVgqwwIwH0JUvAwsJChwQwuOQ4jrJtO/CsfQBc11We56lWqyXfOySALNgJdlmuWzNSB/P5vBKyyJnxMjxBs9mc2tvbEye+DN1l7uYhuaZvAXg1LaQyOOkRL3d3d8XLishHOEd1DMfHx7UEYLjCrCop2aXP2Mht4QxjoyWADi0BxGddZm80GjpWYSL5TfpkYnHAOBK/yxhoCZAl1et1PbharWrUajX9m/SJBESRJUlAr6fvW0CvZyyxOIQPN4kbnv1mlwQERGPhMbHli/Q5Yv5lSdDnSYelrlLWIQGRJS1cvjk1RdBTArCZAferBPT7IkjvcuP7t3pKADaxEpB5+r10FXv3x3kKqqUlgM+DkQB76OFhKzdycAnAo5KynTlraFTZQ4/gqH3ursd9EjLIAVoC7KGCAxFWNqSjWgLoS5aAfS+C7EzJcrLKOjSkrNwoFu0ToPz6n8pv3dFQXjPyRdA9CbDsk/ZDx5SQxWiAsg4X7vE361NedQsn/P0SELwIgmzaHiZMtpMcKK+pWlUuVF6j0v0iSMcw/+QFLQF+y13xbv/GpF4CWUt5tV+FTEsAY6MlgA4tASxlnaUo362yLGLlh2Lo1iCjj4nFAeNI/H9sDHbYxesEfcK//XvSoq9Fkf0/JCDqDWfV3I+TJGCLne19CzAvgtoS8OBF0APC6OdvAQYAj2xzC/IfXBsAAAAASUVORK5CYII=");
  background-position: left -0.2vh;
  background-size: 3vh;
  width: 30px;
  height: 25px;
  float: left;
  cursor: pointer;
}

.rating {}

.stars-outer {
  position: relative;
  width: 80px;
  box-sizing: border-box;
  margin-top: 5px;
  margin-left: 1.5vw;
}

.stars-inner {
  top: 0;
  box-sizing: border-box;
  position: absolute;
  overflow: hidden;
}

.stars-outer::before {
  content: "\f005 \f005 \f005 \f005 \f005";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  color: #ccc;
  width: 100%;
}

.stars-inner::before {
  content: "\f005 \f005 \f005 \f005 \f005";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  color: #eb9224;
}

b {
  color: #ffa941;
}

span {
  font-weight: 700;
}

.display-container {
  display: flex;
  align-items: center;
  height: 3vh;
  overflow-x: scroll;
  gap: 10px;
  overflow-y: hidden;
  padding-bottom: 5px;
}

.display-items-container {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  font-weight: 500;
  background-color: rgb(255, 255, 255);
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 3px;
  padding-bottom: 3px;
  gap: 10px;
}

.display-container::-webkit-scrollbar {
  display: block;
  height: 8px;
  cursor: pointer;
}

.display-container::-webkit-scrollbar-thumb {
  background-color: #eb9224;
  border-radius: 5px;
  border: 1px solid slategray;
  cursor: pointer;
}

.date-picker {
  border-radius: 5px;
}

.date-picker:hover {
  border: 1px solid slategray;
}

.date-input>div {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.select-date {
  width: 15vw;
  height: 10vh;
}

.date-input {
  display: grid;
  grid-template-rows: 50% 50%;
  gap: 0.5vh;
  text-align: center;
}

.top-container-child {
  display: grid;
  grid-template-columns: 30% 70%;
}

.top-container-child-dropdown {
  display: grid;
  grid-template-rows: 50% 50%;
}

.top-container {
  margin-left: auto;
  margin-right: auto;
  width: 18vw;
  margin-top: 3vh;
  display: grid;
  gap: 10px;
  grid-template-rows: 10% 10% 10% 10% 10% 10% 10%;
}

.top-container-status-activated {
  margin-left: auto;
  margin-right: auto;
  width: 18vw;
  margin-top: 3vh;
  display: grid;
  gap: 10px;
  grid-template-rows: 10% 10% 10% 17% 10% 10% 10%;
}

.top-container-category-activated {
  margin-left: auto;
  margin-right: auto;
  width: 18vw;
  margin-top: 3vh;
  display: grid;
  gap: 10px;
  grid-template-rows: 10% 10% 10% 10% 17% 10% 10%;
}

.top-container-user-activated {
  margin-left: auto;
  margin-right: auto;
  width: 18vw;
  margin-top: 3vh;
  display: grid;
  gap: 10px;
  grid-template-rows: 10% 10% 10% 10% 10% 17% 10%;
}

.top-container-status-and-category-activated {
  margin-left: auto;
  margin-right: auto;
  width: 18vw;
  margin-top: 3vh;
  display: grid;
  gap: 10px;
  grid-template-rows: 10% 10% 10% 17% 17% 10% 10%;
}

.top-container-status-and-user-activated {
  margin-left: auto;
  margin-right: auto;
  width: 18vw;
  margin-top: 3vh;
  display: grid;
  gap: 10px;
  grid-template-rows: 10% 10% 10% 17% 10% 17% 10%;
}

.top-container-user-and-category-activated {
  margin-left: auto;
  margin-right: auto;
  width: 18vw;
  margin-top: 3vh;
  display: grid;
  gap: 10px;
  grid-template-rows: 10% 10% 10% 10% 17% 17% 10%;
}

.top-container-user-and-status-and-category-activated {
  margin-left: auto;
  margin-right: auto;
  width: 18vw;
  margin-top: 3vh;
  display: grid;
  gap: 10px;
  grid-template-rows: 10% 10% 10% 17% 17% 17% 10%;
}

.low-container {
  display: grid;
  grid-template-rows: 50% 40%;
  width: 18vw;
  margin-left: auto;
  margin-right: auto;

}

.side-panel-container {
  display: grid;
  height: 94vh;
  grid-template-rows: 50% 50%;
  border-right: 1px solid slategray;
}

#clear-all-button {
  width: 5vw;
  height: 2.5vh;
  border-radius: 5px;
  border: none;
  margin-left: 8vw;
  cursor: pointer;
  border: 1px solid slategray;
}

#clear-all-button:hover {
  background-color: #cfcfcf;
  font-weight: 500;
}

#filter-button {
  height: 3vh;
  border-radius: 5px;
  border: none;
  width: 15vw;
  background-color: #fb9209;
  cursor: pointer;
  border: 1px solid slategray;
  margin-top: 3vh;
  font-weight: 400;
}

#filter-button:hover {
  background-color: #e68608;
  font-weight: 500;
}

#filter-buttons {
  display: flex;
  justify-content: center;
}

.date-chooser {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
