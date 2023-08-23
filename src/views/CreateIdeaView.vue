<script setup>
import CarouselImage from "../components/CarouselImage.vue";
import CustomButton from "../components/CustomButton.vue";
import CustomInput from "../components/CustomInput.vue";
import CustomDropDown from "../components/CustomDropDown.vue";
import CustomDialog from "../components/CustomDialog.vue";
import { ref, onMounted, watchEffect, computed, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import router from "../router";
import {
  getCategory,
  getIdea,
  updateIdea,
  deleteIdea,
  getAllImages,
  createIdea,
  getImageByIdeaId,
  getImageById,
  addRatingToIdea,
  deleteIdeaRatingFromUser
} from "../services/idea.service";
import { getCurrentUsername, getCurrentRole } from "../services/user_service";

const inputValue = ref("");
const statusValue = ref("open");
const textValue = ref("");
const categoryOptions = ref([]);
const categoriesSelected = ref([]);
const titleError = ref("");
// const statusError = ref(false);
const textError = ref("");
const categoryError = ref("");

const currentUsername = getCurrentUsername();
const slideImages = ref([]);
const currentRole = getCurrentRole();

const currentImageIndex = ref(null);
const selectedImageBase64 = ref("");
const selectedImageName = ref("");
const selectedImageType = ref("");

const updatedIdea = ref(null);
updatedIdea.value = useRoute().query;
const isWatchEffectExecuted = ref(false);

const onlyForDeleteCategories = ref([]);

const ideaNotValid = ref(false);
const currentIdeaViewMode = ref(null);
const raters = ref([]);

const stars = ref(null);
const ratingSet = ref({
  isSet: false,
  ratingNumber: 0,
});

const canStarsAppear = ref(false);

const regex =
  /^(?=.*[A-Za-z0-9].*[A-Za-z0-9].*[A-Za-z0-9].*[A-Za-z0-9].*[A-Za-z0-9]).*$/;

const handleSelectedCategories = (selectedCategories) => {
  categoriesSelected.value = selectedCategories;
};

onMounted(async () => {

  // must optimize a lot here, we shouldn't load all the images at first, it will take a lot of time
  // initially, load the image we need and then loading one image at a time, depending on the direction
  // we go (arrows <-> left, right)
  //LOCAL STORAGE USAGE
  slideImages.value = [];
  // const dataImage = await getImageById(1);
  const dataImage = await getAllImages();
  const imageUrl = dataImage.map((item) => {
    return `data:image/${item.fileType};name=${item.fileName};base64,${item.base64Image}`;
  });
  // const imageUrl = `data:image/${dataImage.fileType};name=${dataImage.fileName};base64,${dataImage.base64Image}`
  slideImages.value = imageUrl;

  const response = await getIdea(ideaId);

  currentIdeaViewMode.value = await response;

  currentIdeaViewMode.value.ratings.forEach((rating, index) => {
    raters.value.push(rating)
  })

  if (updatedIdea.value == null) {
    categoriesSelected.value = [];
  }
  const dataCategory = await getCategory();
  const categoryNames = dataCategory.map((category) => category.text);
  categoryOptions.value = categoryNames;

  const allRatings = await currentIdeaViewMode.value.ratings;

  if (allRatings.length == 0) {
    canStarsAppear.value = true;
  }
  allRatings.forEach((rating, index) => {
    if (rating.userUsername == getCurrentUsername()) {
      canStarsAppear.value = true;
      ratingSet.value.isSet = true;
      ratingSet.value.ratingNumber = rating.ratingNumber;

      setTimeout(() => {
        stars.value = document.querySelectorAll(".star");
        stars.value.forEach((star, index) => {
          if (index < ratingSet.value.ratingNumber) {
            star.style.backgroundPosition = "left -11.6vh";
          } else {
            star.style.backgroundPosition = "left -0.2vh";
          }

          star.addEventListener("mouseenter", () => {
            if (index == 0 && !ratingSet.value.isSet) {
              star.style.backgroundPosition = "left -11.6vh";
            } else if (!ratingSet.value.isSet) {
              let number = index;
              while (number >= 0) {
                stars.value[number].style.backgroundPosition = "left -11.6vh";
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
      }, 0)
    } else {
      canStarsAppear.value = true;
    }
  });

});

// using deep because of the nested propreties, this is used for removing a rating if we put 0 stars
watch(ratingSet, async (newValue) => {
  if (!newValue.isSet) {
    await deleteIdeaRatingFromUser(ideaId, getCurrentUsername());
  }
}, { deep: true })

watch(categoriesSelected, (newValue) => {
  if (newValue.length > 0) {
    categoryError.value = "";
  }
});

watch(textValue, (newValue) => {
  if (newValue !== "") {
    textError.value = "";
  }
});

//If the component is handling the update, we update the fields only once, we dont wanna update them multiple times
// that s why we have a var
watchEffect(() => {
  if (!isWatchEffectExecuted.value && updatedIdea.value !== null) {
    updateIdeaFields();
    isWatchEffectExecuted.value = true;
  }
});

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
          star.style.backgroundPosition = "left -11.6vh";
        } else if (!ratingSet.value.isSet) {
          let number = index;
          while (number >= 0) {
            stars.value[number].style.backgroundPosition = "left -11.6vh";
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
          star.style.backgroundPosition = "left -11.6vh";
        } else {
          star.style.backgroundPosition = "left -0.2vh";
        }
      });
      ratingSet.value.isSet = false;
    }
  }
}

//This function is very important since it checks if the component is gonna update or create an idea
const isUpdatedIdeaEmpty = computed(() => {
  return JSON.stringify(updatedIdea.value) === "{}";
});
//This function change the text when you are on create,update or delete
const pageTitle = computed(() => {
  if (showDeletePopup) {
    return "Delete your Idea";
  } else if (isUpdatedIdeaEmpty.value) {
    return "Create an Idea";
  } else if (disableFields) {
    return "View Idea";
  } else {
    return "Update Idea";
  }
});

//this function transforms my whole image string into 3 parts: type, name and base64
//needed for the request dto
function transformImageDataIntoValues(dataString) {
  const base64Index = dataString.indexOf(",") + 1;
  const base64Data = dataString.slice(base64Index);
  selectedImageBase64.value = base64Data;

  const indexOfBase64 = dataString.indexOf(";base64");
  const everythingBeforeBase64 = dataString.substring(0, indexOfBase64);

  const indexOfEqual = everythingBeforeBase64.indexOf("=");
  selectedImageName.value = everythingBeforeBase64.substring(
    indexOfEqual + 1,
    everythingBeforeBase64.length
  );

  selectedImageType.value = everythingBeforeBase64.substring(
    everythingBeforeBase64.indexOf(":") + 1,
    everythingBeforeBase64.indexOf(";")
  );
  const obj = {
    name: selectedImageName.value,
    type: selectedImageType.value,
    base: selectedImageBase64.value,
  };
  return obj;
}

//This is the function that is handling the updating in the db
async function updateIdeaFunction() {
  const updatedIdeaId = updatedIdea.value.updateId;
  const newTitle = inputValue.value;
  const newStatus = statusValue.value;
  const newText = textValue.value;
  const newCategoryList = categoriesSelected.value.map((category) => {
    return { text: category };
  });
  if (
    newTitle !== "" &&
    newStatus !== "" &&
    newText !== "" &&
    categoriesSelected.value.length > 0
  ) {
    transformImageDataIntoValues(slideImages.value[currentImageIndex.value]);

    const imageDTO = {
      fileName: selectedImageName.value,
      fileType: selectedImageType.value,
      image: selectedImageBase64.value,
    };

    await updateIdea(
      updatedIdeaId,
      newTitle,
      newText,
      newStatus,
      newCategoryList,
      imageDTO
    );
    router.back();
  }
}

//Checking what we want to do (update or create) since we use the same component
async function shouldCreateOrUpdate() {
  if (JSON.stringify(updatedIdea.value) === "{}") {
    createIdeaFunction();
  } else {
    updateIdeaFunction();
  }
}

//This is used for updating all the fields in the view when clicking update
async function updateIdeaFields() {
  if (updatedIdea.value != null) {
    inputValue.value = updatedIdea.value.updateTitle;
    textValue.value = updatedIdea.value.updateText;
    statusValue.value = updatedIdea.value.updateStatus.toLowerCase();
    const categoryArray = JSON.parse(updatedIdea.value.updateCategoryList);
    categoryArray.forEach((category, index) => {
      categoriesSelected.value.push(category.text);
    });
  }
}

// we stringify the categories selected and send it to the dropdown and then parse it there
function stringifyCategory() {
  return JSON.stringify(categoriesSelected.value);
}

const getCurrentIndex = (currentIndex) => {
  currentImageIndex.value = currentIndex;
};

//updating the values we get from the carousel emit
const getSelectedImageValues = (
  selectedImageBase64Param,
  selectedImageNameParam,
  selectedImageTypeParam
) => {
  selectedImageBase64.value = selectedImageBase64Param;
  selectedImageName.value = selectedImageNameParam;
  selectedImageType.value = selectedImageTypeParam;
};

//set the inital current index in the carousel, depending on the idea id
async function initialCurrentIndex() {
  if (JSON.stringify(updatedIdea.value) !== "{}") {
    if (showDeletePopup) {
      //if we delete
      const data = await getImageByIdeaId(updatedIdea.value.id);
      let foundIndex = 0;

      slideImages.value.forEach((image, index) => {
        if (transformImageDataIntoValues(image).base === data.image) {
          foundIndex = index;
        }
      });
      return foundIndex;
    }
    if (updatedIdea.value.disableFields) {
      //if we are viewing
      const data = await getImageByIdeaId(updatedIdea.value.id);
      let foundIndex = 0;

      slideImages.value.forEach((image, index) => {
        if (transformImageDataIntoValues(image).base === data.image) {
          foundIndex = index;
        }
      });
      return foundIndex;
    } else {
      //if we are updating
      const data = await getImageByIdeaId(updatedIdea.value.updateId);
      let foundIndex = 0;

      slideImages.value.forEach((image, index) => {
        if (transformImageDataIntoValues(image).base === data.image) {
          foundIndex = index;
        }
      });
      return foundIndex;
    }
  } else {
    // if we are creating
    return 0;
  }
}

async function createIdeaFunction() {
  const rawCategoriesValue = categoriesSelected.value;
  const categoryErrorCheck =
    !Array.isArray(rawCategoriesValue) || rawCategoriesValue.length === 0;

  // extra checks to assure the value of input and text
  if (textValue.value === undefined || textValue.value === null) {
    textValue.value = "";
  }
  if (inputValue.value === undefined || inputValue.value === null) {
    inputValue.value = "";
  }

  let okInput = 0;
  for (let i = 0; i < inputValue.value.length; i++) {
    if (inputValue.value[i] !== " ") {
      okInput = 1;
      break;
    }
  }
  if (okInput == 0) {
    inputValue.value = "";
  }
  const titleErrorCheck =
    inputValue.value === null ||
    inputValue.value === "" ||
    inputValue.value === undefined ||
    okInput === 0;

  let okText = 0;
  for (let j = 0; j < textValue.value.length; j++) {
    if (textValue.value[j] !== " ") {
      okText = 1;
      break;
    }
  }
  if (okText == 0) {
    textValue.value = "";
  }
  const textErrorCheck =
    textValue.value === null ||
    textValue.value === "" ||
    textValue.value === undefined ||
    okText === 0;

  if (titleErrorCheck) {
    titleError.value = "Please select a title...";
    document.getElementById("title-input").className = "";
    setTimeout(() => {
      document.getElementById("title-input").className = "shake";
    }, "10");
  } else {
    titleError.value = "";
  }
  if (textErrorCheck) {
    textError.value = "Please write some text...";
    document.getElementById("textarea-id").className = "";
    setTimeout(() => {
      document.getElementById("textarea-id").className = "shake";
    }, "10");
  } else {
    textError.value = "";
  }
  if (categoryErrorCheck) {
    categoryError.value = "Please select at least one category...";
    document.getElementById("category-input").className = "input-width";
    setTimeout(() => {
      document.getElementById("category-input").className = "input-width shake";
    }, "10");
  } else {
    categoryError.value = "";
  }

  if (!titleErrorCheck && !textErrorCheck && !categoryErrorCheck) {
    const categoryTexts = rawCategoriesValue.map((category) => ({
      text: category,
    }));

    const imageDTO = {
      fileName: selectedImageName.value,
      fileType: selectedImageType.value,
      image: selectedImageBase64.value,
    };

    const data = await createIdea(
      inputValue.value,
      textValue.value,
      statusValue.value.toUpperCase(),
      categoryTexts,
      imageDTO,
      currentUsername
    );
    router.push({ name: "my" });
    return data;
  }
}
const disableFields = useRoute().query.disableFields === "true";
const fieldsDisabled = ref(disableFields);
const showDeletePopup = useRoute().query.showDeletePopup === "true";
const deletePopup = ref(showDeletePopup);
const ideaId = useRoute().query.id;

if (showDeletePopup) loadIdeaForDelete();
if (disableFields) loadIdeaForDelete();

const currentIdeaTitle = ref("");
async function loadIdeaForDelete() {
  const response = await getIdea(ideaId);
  if (response === "Idea doesn't exist.") {
    ideaNotValid.value = true;
  } else {
    currentIdeaTitle.value = response.title;
    inputValue.value = response.title;
    statusValue.value = response.status.toLowerCase();

    // for (let category of response.categoryList) {
    //   onlyForDeleteCategories.value.push(" " + category.text);
    // }

    onlyForDeleteCategories.value = "Your categories...";
    for (let category of response.categoryList) {
      categoriesSelected.value.push(category.text);
    }

    textValue.value = response.text;
  }
}

const customDialog = ref(null);

async function handleCancel() {
  customDialog.value.close();
  await router.back();
}

async function handleConfirm() {
  await deleteIdea(ideaId);
  customDialog.value.close();
  await router.back();
}

const uploadedImage = ref(null);
async function uploadImage(event) {
  uploadedImage.value = event.target.files[0]; //we get the file from the computer

  //then we create or custom url containg all the 3 values: base64, type, name
  const newUploadedImageUrl = ref("");
  newUploadedImageUrl.value += `data:image/${uploadedImage.value.type};name=${uploadedImage.value.name};base64,`;
  const blob = await uploadedImage.value.arrayBuffer();
  const byteArray = new Uint8Array(await blob);

  let binaryString = "";

  for (let i = 0; i < byteArray.length; i++) {
    binaryString += String.fromCharCode(byteArray[i]);
  }

  const base64String = btoa(binaryString);

  newUploadedImageUrl.value += `${base64String}`;

  slideImages.value.push(newUploadedImageUrl.value);
}

async function shouldDisableArrows() {
  if (updatedIdea.value.disableFields === "true") {
    return true;
  } else {
    return false;
  }
}

function onMouseLeave() { }

function onMouseEnter() { }

function removeSelection(index) {
  if (!disableFields) {
    const indexValue = index;
    categoriesSelected.value = categoriesSelected.value.filter(
      (category, index) => indexValue !== index
    );
  }
}

async function setRating(indexValue) {
  stars.value = document.querySelectorAll(".star");
  ratingSet.value.isSet = true;
  ratingSet.value.ratingNumber = indexValue;

  stars.value.forEach((star, index) => {
    if (index < indexValue) {
      star.style.backgroundPosition = "left -11.6vh";
    }
  });

  await addRatingToIdea(
    ideaId,
    ratingSet.value.ratingNumber,
    getCurrentUsername()
  );
}

function leaveStar(indexValue) {
  if (ratingSet.value.isSet) {
    ratingSet.value.ratingNumber = indexValue;
  } else {
    ratingSet.value.ratingNumber = 0;
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

function getStarRating(userRating) {
  const starPercentage = (userRating / 5) * 100;

  console.log(userRating)

  // const starPercentageRounded = Math.round(starPercentage / 10) * 10;

  return starPercentage + "%";
}

function getShortText(text, numberOfRows, numberOfCharacters) {
  let shortText = "";
  let row = "";
  let countRows = 1;
  let splitVar = false;

  if (text.length <= numberOfCharacters * numberOfRows) return text;

  for (let i = 0; i < text.length; i++) {
    if (text[i] == " ") {
      splitVar = true;
    }
  }
  if (splitVar) {
    const wordsArray = text.split(" ");
    for (let word of wordsArray) {
      if (row.length + word.length <= numberOfCharacters - 1) row += " " + word;
      else {
        if (countRows === numberOfRows) {
          row += " ";
          for (let letter of word) {
            if (row.length <= numberOfCharacters - 4) row += letter;
          }
          row += "...";
          shortText += row;
          break;
        } else {
          row += "\n";
          shortText += row;
          countRows++;
          row = word;
        }
      }
    }

    return shortText;
  } else {
    const splitArray = [];
    let returnText = "";

    for (let i = 0; i < text.length; i += numberOfCharacters) {
      splitArray.push(text.slice(i, i + numberOfCharacters));
    }

    for (let i = 0; i < splitArray.length; i++) {
      returnText += splitArray[i] + "\n";
    }

    for (let word of returnText) {
      if (row.length + word.length <= numberOfCharacters - 1) row += "" + word;
      else {
        if (countRows === numberOfRows) {
          row += " ";
          for (let letter of word) {
            if (row.length <= numberOfCharacters - 4) row += letter;
          }
          row += "...";
          shortText += row;
          break;
        } else {
          row += "\n";
          shortText += row;
          countRows++;
          row = word;
        }
      }
    }
    return shortText;
  }
}

</script>

<template>
  <div class="wrapper">
    <div class="create-idea-container">
      <div class="idea-title">
        <h1>
          {{ pageTitle }}
        </h1>
      </div>

      <div class="input-container">
        <div class="idea">
          <label for="title-idea" class="label">Title:</label>
          <CustomInput id="title-input" v-model="inputValue" :disabled="fieldsDisabled" :maxlength="50" :placeholder="!titleError == '' ? titleError : 'Write a title here...'
            " :widthInPx="16" style="background-color: rgba(255, 145, 153, 0.679)" class="" :style="!titleError == ''
    ? {
      'border-color': 'red',
      'background-color': 'rgb(255, 145, 153, 0.379)',
      'border-radius': '4px',
    }
    : { 'background-color': 'white', 'border-radius': '4px' }
    " />
        </div>

        <div class="idea">
          <label for="status-idea" class="label" @mouseleave="onMouseLeave" @mouseenter="onMouseEnter">Status:</label>
          <select v-model="statusValue" @mouseenter="onMouseEnter" style="width: 16vw" @mouseleave="onMouseLeave"
            name="status-idea" class="custom-select" :disabled="fieldsDisabled">
            <option value="open">Open</option>
            <option value="draft">Draft</option>
            <option v-if="!isUpdatedIdeaEmpty && currentRole == 'ADMIN'" value="implemented">
              Implemented
            </option>
          </select>
        </div>

        <div class="idea">
          <label for="category-idea" class="label">Categories:</label>

          <CustomDropDown id="category-input" v-if="!showDeletePopup && !disableFields"
            @update:selectedOptions="handleSelectedCategories" :disabled="fieldsDisabled" :variants="categoryOptions"
            :canAddInDropdown="true" :selectedObjects="stringifyCategory()" :input-placeholder="categoryError ? categoryError : 'Select your categories...'
              " class="input-width" :width-in-vw="16" :error="categoryError">
          </CustomDropDown>
          <input v-if="showDeletePopup || disableFields || ideaNotValid" v-model="onlyForDeleteCategories"
            :disabled="disableFields" style="
              width: 15.8vw;
              height: 2vh;
              background-color: rgba(255, 255, 255, 0.597);
              border-radius: 3px;
              border: 1px slategray;
              color: black;
            " />
        </div>

        <div class="display-categories-container">
          <div class="display-categories" v-for="(category, index) in categoriesSelected" :key="index" :style="!disableFields
            ? { 'background-color': 'white' }
            : { 'background-color': '#cccccc' }
            " @click="removeSelection(index)">
            {{ category }} <b>x</b>
          </div>
        </div>
      </div>

      <div class="idea-text">
        <div class="text-input-wrapper">
          <div class="input-text-container">
            <textarea v-model="textValue" :disabled="fieldsDisabled" :maxlength="500" :placeholder="!textError == '' ? textError : 'Write a text here...'
              " id="textarea-id" :style="!textError == ''
    ? {
      'border-color': 'red',
      'background-color': 'rgb(255, 145, 153, 0.479)',
      'border-radius': '2px',
    }
    : { 'background-color': 'white', 'border-radius': '2px' }
    ">
            </textarea>
          </div>
          <div class="input-bottom">
            <p id="maxlength-textarea" :style="{
              color: textValue
                ? textValue.length == 500
                  ? 'red'
                  : 'slategray'
                : 'slategray',
              opacity: textValue
                ? textValue.length == 500
                  ? '100'
                  : '70%'
                : '70%',
            }">
              {{ textValue ? textValue.length : 0 }} / 500
            </p>
          </div>
        </div>
      </div>

      <div class="carousel-container">
        <div class="idea-carousel">
          <CarouselImage class="carousel-image" :images="slideImages" @current-index="getCurrentIndex"
            @selected-image-values="getSelectedImageValues" :initialCurrentIndex="initialCurrentIndex()"
            :disabledArrow="shouldDisableArrows()" :imageHeightPercentage="100" />
        </div>
        <div class="add-image">
          <input type="file" id="upload" hidden :disabled="fieldsDisabled" ref="uploadedImage"
            v-on:change="uploadImage($event)" />
          <label for="upload" class="add-image-idea" v-if="!deletePopup && !disableFields"
            style="display: flex; align-items: center">
            Upload Image
            <span class="material-symbols-outlined" style="margin-left: 5px">
              attach_file
            </span>
          </label>
        </div>
      </div>

      <div class="create-container">
        <CustomButton id="create-idea" @click="shouldCreateOrUpdate" :disabled="fieldsDisabled"
          v-if="!deletePopup && !disableFields" :height-in-px="40" :width-in-px="300">
          {{ isUpdatedIdeaEmpty ? "Create Idea" : "Update Idea" }}
        </CustomButton>
        <div class="rating" style="overflow: hidden" v-if="disableFields &&
          currentIdeaViewMode && currentIdeaViewMode.username !== getCurrentUsername() && canStarsAppear"
          @mouseenter="onMountStars()">
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
        <div class="rate-idea-text" v-if="disableFields &&
          currentIdeaViewMode && currentIdeaViewMode.username !== getCurrentUsername() && canStarsAppear">{{
    ratingSet.ratingNumber }} of
          5
        </div>
        <div class="no-raters" style="margin-bottom: 0.5vh;" v-if="raters.length > 0 && canStarsAppear">Ratings</div>
        <div class="list-of-raters" v-if="canStarsAppear && disableFields && currentIdeaViewMode
          && currentIdeaViewMode.username == getCurrentUsername()">
          <div class="rater-stars" v-for="(rater, index) in raters" :key="index">
            <div class="rater-name" v-if="raters.length > 0">{{ getShortText(rater.userUsername, 1, 8) }}</div>
            <div class="stars-outer" v-if="raters.length > 0">
              <div class="stars-inner" :style="{ width: getStarRating(rater.ratingNumber) }"></div>
            </div>
          </div>
          <div class="no-raters" v-if="raters.length === 0">Pending Feedback: No Ratings Yet</div>
        </div>
        <img v-if="!canStarsAppear && disableFields" src="@/assets/img/loading-stars.gif"
          style="height: 6vh; margin-bottom: 3vh; animation: 1s fadeOut;">
        <CustomDialog ref="customDialog" :open="deletePopup || ideaNotValid" :title="!ideaNotValid
          ? `Are you sure you want to delete '${currentIdeaTitle}'?`
          : `This idea doesn't exist anymore`
          " :message="!ideaNotValid
    ? 'This item will be deleted immediately. You can\'t undo this action!'
    : 'Please go back to the main page.'
    ">
          <div class="dialog-actions" v-if="deletePopup && !ideaNotValid">
            <button @click="handleCancel">Cancel</button>
            <button @click="handleConfirm">Confirm</button>
          </div>
          <div class="dialog-actions" v-if="ideaNotValid">
            <button @click="handleConfirm" id="back-button">Back</button>
          </div>
        </CustomDialog>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-raters {
  font-weight: 600;
  font-size: 1.5vh;
}

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

.rater-name {
  width: 5vw;
  margin-top: 5px;
  margin-left: 0.2vw;
}

.rater-stars {
  display: grid;
  grid-template-columns: 50% 50%;
  margin-right: auto;
  align-items: center;
  justify-content: center;
}

.list-of-raters {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px solid slategray;
  height: 5vh;
  border-radius: 6px;
  overflow-y: auto;
  padding-top: 20px;
  padding-left: 15px;
  padding-bottom: 15px;
  padding-right: 15px;
  width: 11.5vw;
}

.list-of-raters::-webkit-scrollbar {
  display: block;
  color: slategray;
  width: 7px;
}

.list-of-raters::-webkit-scrollbar {
  display: block;
  width: 7px;
}

.list-of-raters::-webkit-scrollbar-thumb {
  background-color: #ffa941;
  border-radius: 7px;
  border: 1px solid slategray;
}

#title-input {
  border-radius: 2px;
  border: 1px solid white;
  background-color: white;
  padding: 5px;
  box-sizing: border-box;
  cursor: text;
}

.rate-idea-text {
  color: rgba(0, 0, 0, 0.445);
  font-weight: 650;
  animation: fadeIn 1s
}

.rating {
  height: 4.6vh;
  width: 11vw;
  border: 1px solid slategray;
  border-radius: 5px;
  background-color: #dedee293;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 1s
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

.star {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAABQCAYAAAAZQFV3AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABOFJREFUeNrsmEFoHFUYx9/MdHfTJRKzUhBaFiL1YghZCFQUIV6UQJuLWCgr8eKpIoiFSqsHQYrmYj14KHqxKAl6MbA5eCgKRVAMBhpCwIJQCETRQzTsNtnO7s74+17fbGc3M7OzZhUsHfjzdvd97/++973vff99Y/m+rwb5WL0Idz60h2nckTc8Nw2hncLmAnhtIB7i3VGan8VD8Dhebh+U8FOaX8Bh4EB48R8TQlai+QnkgMTxD/AYpFt9EULk0EyBD8Dn4BPT9TZ4CrwD6Wos4V+XrUdpXzQk4tUEkAFXwNUu+1fAWWO7anADLDLJTkCYpf0K3DQe3Ui5oUI6B8ShlyBstZfMMiXoX4MV8GZKQgnJcXA6nKPtGJoE/gZ8Cy6mIJPwnIJsL3ZTIB2h+U6WANZjyE6Aj8Cz3WT7TooJ7HUwneDdc+BaFFnc0SuCzQTCTWOT+iwfN6cjWJ6clo9NzOS5Bcb6IZTZj5pU+syEYNV8XzA2Y6lOCptyhGbDeDFPnJa6TlGZ5rxJ/nxkSRPCACR5EUyHf4sCNjOgENVn/ecVe+CEy8vLWgJmZ2fd1IRra2vxSbe5eYlmu1gsXo6zmZycTKcpkEn6vC61kM+FQYiUeDdvauP5Ay0ZjyIlgKVv9bVkiBwQVJRX2YwWkKLxrhxB+qYSPaxUKrESANHVrh2PlQAzqSbskAA6UkkA5B0SICvRSzb5ddrMWu4jh8umSLwckLVjSKClWJ6SwsrM76fwLpCAM4x1I9OGjhrN8+AkAyYSyGTDnhEHjCPxeYhBagmIIvtXJOBQkgSY5Z01/76umAy4lbpiG5IqzQuG6Alz9LLmf+IP5hh+AfmxnoSQdUgAg5a6JuuQgMiSFi7fJHkR9JQAbGbA/SoBi4uLWgLK5XIqCdBpkyQBZne3sTm4BGxsbLQlgM+DkYBsNjucyWQKaSXATvCuZFnWHIQqlxMVUOeMx/0RMsgBWgIgcyBVgqwwIwH0JUvAwsJChwQwuOQ4jrJtO/CsfQBc11We56lWqyXfOySALNgJdlmuWzNSB/P5vBKyyJnxMjxBs9mc2tvbEye+DN1l7uYhuaZvAXg1LaQyOOkRL3d3d8XLishHOEd1DMfHx7UEYLjCrCop2aXP2Mht4QxjoyWADi0BxGddZm80GjpWYSL5TfpkYnHAOBK/yxhoCZAl1et1PbharWrUajX9m/SJBESRJUlAr6fvW0CvZyyxOIQPN4kbnv1mlwQERGPhMbHli/Q5Yv5lSdDnSYelrlLWIQGRJS1cvjk1RdBTArCZAferBPT7IkjvcuP7t3pKADaxEpB5+r10FXv3x3kKqqUlgM+DkQB76OFhKzdycAnAo5KynTlraFTZQ4/gqH3ursd9EjLIAVoC7KGCAxFWNqSjWgLoS5aAfS+C7EzJcrLKOjSkrNwoFu0ToPz6n8pv3dFQXjPyRdA9CbDsk/ZDx5SQxWiAsg4X7vE361NedQsn/P0SELwIgmzaHiZMtpMcKK+pWlUuVF6j0v0iSMcw/+QFLQF+y13xbv/GpF4CWUt5tV+FTEsAY6MlgA4tASxlnaUo362yLGLlh2Lo1iCjj4nFAeNI/H9sDHbYxesEfcK//XvSoq9Fkf0/JCDqDWfV3I+TJGCLne19CzAvgtoS8OBF0APC6OdvAQYAj2xzC/IfXBsAAAAASUVORK5CYII=");
  background-position: left -0.2vh;
  background-size: 4vh;
  width: 37px;
  height: 36px;
  float: left;
  cursor: pointer;
}

#back-button:hover {
  background-color: #f8920b;
}

.comment-input-bottom {
  width: 29vw;
}

.text-input-wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 22vw;
  background-color: white;
  border: 1px solid slategray;
  border-radius: 5px;
  min-height: 17vh;
  max-height: 22vh;
  box-sizing: border-box;
  margin-top: 10px;
  word-wrap: break-word;
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-3px);
  }

  50% {
    transform: translateX(3px);
  }

  75% {
    transform: translateX(-3px);
  }

  100% {
    transform: translateX(0);
  }
}

.shake {
  animation-name: shake;
  animation-duration: 0.4s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: 1;
}

b {
  color: #ffa941;
}

#maxlength-textarea {
  position: absolute;
  bottom: 0;
  right: 11vw;
  padding: 0;
  margin: 0;
  margin-bottom: 1px;
}

#textarea-id::-webkit-scrollbar {
  display: block;
  color: slategray;
  width: 7px;
}

#textarea-id:hover::-webkit-scrollbar {
  display: block;
  width: 7px;
}

#textarea-id::-webkit-scrollbar-thumb {
  background-color: #ffa941;
  border-radius: 7px;
  border: 1px solid slategray;
}

.carousel-image {
  height: 13vw;
  max-width: 19vw;
  object-fit: fill;
  margin-top: 20px;
}

.carousel-image>img {
  border: 1px solid slategray;
}

#textarea-id {
  resize: none;
  height: 14.5vh;
  width: 21.5vw;
  overflow: auto;
  box-sizing: border-box;
  border: 1px solid rgba(112, 128, 144, 0.349);
  border-radius: 3px;
  word-wrap: break-word;
  margin-top: 4px;
  padding: 5px;
}

#textarea-id:hover {
  border: 1px solid slategray;
}

#textarea-id:active {
  border: 1px solid slategray;
}

textarea {
  all: unset;
}

#create-idea {
  background-color: #fb9209;
  border-radius: 5px;
  margin-top: 20px;
}

#create-idea:hover {
  background-color: #e68608;
  font-weight: 500;
}

.wrapper {
  align-items: center;
  justify-content: center;
  display: flex;
  height: 94vh;
  /* border-top: 1px solid slategray; */
}

.create-idea-container {
  align-items: center;
  display: grid;
  grid-template-rows: 10% 20% 20% 35% 15%;
  height: 87vh;
  width: 25vw;
  padding: 10px;
  border-radius: 10px;
  background-color: #e9e9e9;
  user-select: none;
  margin-bottom: 15px;
}

.add-image-idea {
  background-color: gray;
  color: white;
  padding: 0.5rem;
  font-family: sans-serif;
  cursor: pointer;
  margin-top: 5px;
  border-radius: 6px;
  height: 1.9vh;
}

.add-image-idea:hover {
  background-color: rgba(128, 128, 128, 0.753);
}

.custom-select {
  border: 1px solid white;
  border-radius: 3px;
  height: 27px;
  cursor: pointer;
}

.custom-select:hover {
  border: 1px solid slategray;
}

*:focus {
  outline: none;
}

.idea {
  display: grid;
  grid-template-columns: 5vw 16vw;
  width: 21vw;
  align-items: center;
}

.display-categories {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  border-radius: 5px;
  font-weight: 500;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 3px;
  padding-bottom: 3px;
  gap: 10px;
}

.display-categories-container {
  margin-left: 5vw;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 4vh;
  width: 16vw;
  overflow-x: scroll;
}

.display-categories-container::-webkit-scrollbar {
  display: block;
  color: slategray;
  width: 5px;
  height: 7px;
}

.display-categories-container::-webkit-scrollbar-thumb {
  background-color: #ffa941;
  border-radius: 5px;
  border: 1px solid slategray;
}

.material-symbols-outlined {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" -25, "opsz" 20;
}

.idea-category {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 300px;
}

.idea-title {
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
}

.input-container {
  display: grid;
  align-items: center;
  flex-direction: column;
  width: 21vw;
  margin: auto;
  gap: 0.5vw;
}

.carousel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 23vw;
  margin: auto;
  margin-top: 10px;
}

.create-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 23vw;
  margin: auto;
  margin-bottom: 5vh;
}

.label {
  padding-right: 20px;
  font-weight: 500;
}

.idea-text {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
}

.label-text {
  padding-top: 20px;
  padding-bottom: 20px;
}

textarea {
  width: 300px;
  height: 150px;
  resize: none;
  padding-top: 5px;
}

input {
  width: 192px;
}

select {
  width: 192px;
}

.add-image {
  padding-bottom: 10px;
}

.dialog-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-actions button {
  margin: 0 5px;
  font-size: 16px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-actions button:nth-child(1) {
  height: 40px;
  width: 80px;
  background-color: #fff;
  border: 1px solid slategray;
  border-radius: 5px;
  margin-right: 10px;
}

.dialog-actions button:nth-child(2) {
  height: 40px;
  width: 80px;
  background-color: #fff;
  border: 1px solid slategray;
  border-radius: 5px;
  margin-right: 10px;
}

.dialog-actions button:nth-child(1):hover {
  box-shadow: 0 2px 2px slategray;
  background-color: rgba(163, 161, 161, 0.565);
}

.dialog-actions button:nth-child(2):hover {
  box-shadow: 0 2px 2px slategray;
  background-color: orange;
}

.border-alert {
  border: 2px solid red;
}
</style>
