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
    selectedDateFrom,
    selectedDateTo,
  ],
  ([
    newInputTitle,
    newInputText,
    newStatusSelected,
    newCategoriesSelected,
    newUserSelected,
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

const filter = async () => {
  const title = inputTitle.value;
  const text = inputText.value;
  const category = categoriesSelected.value;
  const dateFrom = selectedDateFrom.value;
  const dateTo = selectedDateTo.value;
  const user = userSelected.value;
  const status = statusSelected.value;

  const filteredIdeas = await filterIdeas(
    title,
    text,
    status,
    category,
    user,
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
    categoriesSelected.value.length === 0
  ) {
    return "top-container-status-activated";
  }
  if (
    statusSelected.value.length === 0 &&
    categoriesSelected.value.length > 0
  ) {
    return "top-container-category-activated";
  }
  if (statusSelected.value.length > 0 && categoriesSelected.value.length > 0) {
    return "top-container-status-and-category-activated";
  } else {
    return "top-container";
  }
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
        <CustomInput
          v-model="inputTitle"
          :placeholder="`Write a title...`"
          :can-modify-search-value="true"
          :widthInPx="13"
          :height-in-px="2.5"
          :style="{ 'background-color': 'white', 'font-weight': '370' }"
        />
      </div>

      <div class="top-container-child">
        <span class="text">Text:</span>
        <CustomInput
          v-model="inputText"
          class="text-input"
          :placeholder="`Write a text...`"
          :can-modify-search-value="false"
          :widthInPx="13"
          :height-in-px="2.5"
          :style="{ 'background-color': 'white', 'font-weight': '370' }"
        />
      </div>

      <div class="top-container-child">
        <span :class="statusSelected.length > 0 ? 'status2' : 'status'"
          >Status:</span
        >

        <div class="top-container-child-dropdown">
          <CustomDropDown
            :variants="statusOptions"
            @update:selectedOptions="handleSelectedStatus"
            :canAddInDropdown="false"
            :input-placeholder="`Select your statuses...`"
            :clear-all="clearAllDropdownValues"
            :width-in-vw="13"
            :height-in-vh="5"
            :selectedObjects="stringifyOptions('status')"
          >
          </CustomDropDown>

          <div class="display-container">
            <div
              class="display-items-container"
              v-for="(status, index) in statusSelected"
              :key="index"
              @click="removeSelection('statusType', index)"
            >
              {{ status }} <b>x</b>
            </div>
          </div>
        </div>
      </div>

      <div class="top-container-child">
        <span :class="categoriesSelected.length > 0 ? 'category2' : 'category'"
          >Category:</span
        >

        <div class="top-container-child-dropdown">
          <CustomDropDown
            :variants="categoryOptions"
            @update:selectedOptions="handleSelectedCategories"
            :canAddInDropdown="false"
            :input-placeholder="`Select your categories...`"
            :clear-all="clearAllDropdownValues"
            :width-in-vw="13"
            :height-in-vh="5"
            :selectedObjects="stringifyOptions('category')"
          >
          </CustomDropDown>

          <div class="display-container">
            <div
              class="display-items-container"
              v-for="(category, index) in categoriesSelected"
              :key="index"
              @click="removeSelection('categoryType', index)"
            >
              {{ category }} <b>x</b>
            </div>
          </div>
        </div>
      </div>

      <div class="top-container-child">
        <span
          :class="userSelected.length > 0 ? 'user2' : 'user'"
          :style="{ visibility: hideUser ? 'hidden' : 'visible' }"
          >User:</span
        >

        <div class="top-container-child-dropdown">
          <CustomDropDown
            :style="{ visibility: hideUser ? 'hidden' : 'visible' }"
            :variants="userOptions"
            @update:selectedOptions="handleSelectedUsers"
            :canAddInDropdown="false"
            :input-placeholder="`Select your users...`"
            :clear-all="clearAllDropdownValues"
            :width-in-vw="13"
            :height-in-vh="5"
            :selectedObjects="stringifyOptions('user')"
          >
          </CustomDropDown>

          <div class="display-container">
            <div
              class="display-items-container"
              v-for="(user, index) in userSelected"
              :key="index"
              @click="removeSelection('userType', index)"
            >
              {{ user }} <b>x</b>
            </div>
          </div>
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
              <CustomInput
                v-model="selectedDateFrom"
                type="date"
                class="date-picker"
              />
            </div>
            <div>
              <span class="to-date"> To: </span>
              <CustomInput
                v-model="selectedDateTo"
                type="date"
                class="date-picker"
              />
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

.date-input > div {
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
  grid-template-rows: 10% 10% 10% 10% 10% 20%;
}

.top-container-status-activated {
  margin-left: auto;
  margin-right: auto;
  width: 18vw;
  margin-top: 3vh;
  display: grid;
  gap: 10px;
  grid-template-rows: 10% 10% 10% 20% 10% 20%;
}

.top-container-category-activated {
  margin-left: auto;
  margin-right: auto;
  width: 18vw;
  margin-top: 3vh;
  display: grid;
  gap: 10px;
  grid-template-rows: 10% 10% 10% 10% 20% 20%;
}

.top-container-status-and-category-activated {
  margin-left: auto;
  margin-right: auto;
  width: 18vw;
  margin-top: 3vh;
  display: grid;
  gap: 10px;
  grid-template-rows: 10% 10% 10% 20% 20% 20%;
}

.low-container {
  display: grid;
  grid-template-rows: 70% 30%;
  width: 18vw;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 30vh;
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
