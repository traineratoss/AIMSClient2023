<script setup>
import { ref,defineProps,watch, onMounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import CustomLoader from './CustomLoader.vue';

const slides = defineProps(['images', 'selectedImage', 'initialCurrentIndex', 'disabledArrow', 'imageHeightPercentage', 'hiddenArrows']);
const emit = defineEmits(['current-index', 'selected-image-values']);

//IMPORTANT NOTE FOR THE USER TEAM: DON'T SET THE CURRENT INDEX BASED ON THE AVATAR ID, MODIFY IT VIA CODE FOR MULTIPLE USAGE
//INITIALLY SET IT TO 0 AND THEN IF WE ARE ON YOUR PAGE, IGNORE THE WATCHERS DOWN BELOW
//checked the condition with the route path and fixed it, works for both teams
const route = useRoute();

const avatarId = parseInt(localStorage.getItem('avatarId'));

//Initially set it to yours and if im on create idea, it will update automatically
const currentIndex = ref(avatarId);

const selectedImageBase64 = ref(null);
const selectedImageType = ref(null)
const selectedImageName = ref(null);
const imagesLoaded = ref(false);
const shouldDisableArrowsRef = ref(false);
const shouldHideArrowsRef = ref(false);

//this function transforms my whole image string into 3 parts: type, name and base64
//needed for the request dto
function transformImageDataIntoValues(dataString) {
  const base64Index = dataString.indexOf(',') + 1;
  const base64Data = dataString.slice(base64Index);
  selectedImageBase64.value = base64Data;

  const indexOfBase64 = dataString.indexOf(";base64");
  const stringBeforeBase64 = dataString.substring(0, indexOfBase64);

  const indexOfEqual = stringBeforeBase64.indexOf("=");
  selectedImageName.value = stringBeforeBase64.substring(indexOfEqual+1, stringBeforeBase64.length);

  selectedImageType.value = stringBeforeBase64.substring(stringBeforeBase64.indexOf(":")+1, stringBeforeBase64.indexOf(";")) ;
}

// waiting for the images to load and then setting our index 0
watch(
  () => slides.images, 
   (newValue) => {
    if (newValue.length > 0 && imagesLoaded.value === false && route.path === "/create-idea" && slides.images.length > 0) { 
      currentIndex.value = 0;
      transformImageDataIntoValues(slides.images[currentIndex.value])
      emit('current-index', currentIndex.value);
      emit('selected-image-values', selectedImageBase64.value, selectedImageName.value, selectedImageType.value );
      setTimeout(() => {
        imagesLoaded.value = true;
      }, 100)
    }
  }
);

// depending on the case, we set the initial current index (creating -> 0, updating -> the image of the idea we wanna 
// update - ||- view and delete)
watch(
  () => slides.initialCurrentIndex, 
  (newValue) => {
    if (route.path === "/create-idea" && !imagesLoaded.value && slides.images.length > 0) {
      currentIndex.value = newValue;
      currentIndex.value.then((result) => {
        currentIndex.value = result;
        emit('current-index', currentIndex.value);
      })
    }
}
);

// used for when uploading an image, the image shown will be that uploaded one,
// the length will increase and this watch will be triggered
watch(
  () => slides.images.length, 
   (newSlidesImagesLength) => {
    currentIndex.value = newSlidesImagesLength - 1;
    transformImageDataIntoValues(slides.images[currentIndex.value])
    emit('current-index', currentIndex.value);
    emit('selected-image-values', selectedImageBase64.value, selectedImageName.value, selectedImageType.value );
  }
);

watch(
  () => slides.disabledArrow, 
  (newValue) => {
    if (route.path === "/create-idea") {
      shouldDisableArrowsRef.value = newValue;
      shouldDisableArrowsRef.value.then((result) => {
        shouldDisableArrowsRef.value = result;
      })
    }
}
);

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + slides.images.length) % slides.images.length;
  transformImageDataIntoValues(slides.images[currentIndex.value])
  emit('current-index', currentIndex.value);
  emit('selected-image-values', selectedImageBase64.value, selectedImageName.value, selectedImageType.value );
};

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % slides.images.length;
  transformImageDataIntoValues(slides.images[currentIndex.value])
  emit('current-index', currentIndex.value);
  emit('selected-image-values', selectedImageBase64.value, selectedImageName.value, selectedImageType.value );
};
onMounted(() => {
  if(route.name ==='my-profile'){
    imagesLoaded.value = true;
  }
});
</script>

<template>
  <div class="carousel">
    <button @click="prevSlide" :disabled="shouldDisableArrowsRef || !imagesLoaded">
      <i class="fa-solid fa-arrow-left fa-2xl" id="arrow"></i>
    </button>
    <div class="slide-container" :style="imagesLoaded ? (route.name === 'create-idea' ? {'border': '4px solid gray', 'border-radius': '10px'} : 
    {'border': '0px', 'border-radius': '0px'}) : {'border': '0px', 'border-radius': '0px'} ">
      <div
        class="slides"
        :style="imagesLoaded ? { transform: `translateX(-${currentIndex * 100}%)` } : {}"
      >
        <div
          v-if="imagesLoaded"
          v-for="(slide, index) in images"
          :key="index"
          class="slide"
          :class="{ active: currentIndex === index }"
          style="display: flex; flex-direction: column; justify-content: center;"
        >
          <img 
            :src="slide"
            :style="`height: ${imageHeightPercentage}%`"
          />
        </div>
        <div v-if="!imagesLoaded" id="custom-loader">
          <CustomLoader :size="60" />
        </div>
      </div>
    </div>
    <button @click="nextSlide" :disabled="shouldDisableArrowsRef || !imagesLoaded">
      <i class="fa-solid fa-arrow-right fa-2xl" id="arrow2"></i>
    </button>
  </div>
</template>

<style scoped>

#arrow:hover {
  color: #ffa941;
}

#arrow {
  color: gray;
}

#arrow2 {
  color: gray;
}

#arrow2:hover {
  color: #ffa941;
}

.carousel {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 10;
  animation: fadeIn 3s;
}

#custom-loader {
  height: 180px;
  width: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-container {
  display: flex;
  overflow: hidden;
  animation: fadeIn 3s;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.slides {
  display: flex;
  transition: transform 0.3s ease;
}

.slide {
  flex: 0 0 100%;
  background-color: transparent;
  box-sizing: border-box;
}

.slide.active {
  border: none;
}

button {
  margin: 10px;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

img {
  /* height: 100%; */
  width: 100%;
}
</style>