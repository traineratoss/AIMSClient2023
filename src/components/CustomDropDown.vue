<script setup>
import { ref, onMounted, defineProps, watch, watchEffect, nextTick } from "vue";
import CustomLoader from "../components/CustomLoader.vue";

const emit = defineEmits(["update:selectedOptions", "filter-data"]);

const props = defineProps({
  variants: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
  canAddInDropdown: {
    type: Boolean,
    default: false,
  },
  //we need a prop to update from outside the selected objects
  selectedObjects: {
    type: String,
    default: null,
  },
  inputPlaceholder: {
    type: String,
    default: null,
  },
  clearAll: {
    type: Boolean,
    default: false,
  },
  updatePageByClick: {
    type: Object,
    default: null,
  },
  widthInVw: {
    type: Number,
    default: null,
  },
  heightInVh: {
    type: Number,
    default: null,
  }
});

const clearAllDropdownValues = ref(false);

const comboInput = ref(null);
const dropdown = ref(null);
const isDropdownVisible = ref(false);
// loading is used for checking when the props are updated and fully loaded, since i cant use it in the onMount (async function)
const loading = ref(true);
// this is the reactive value with the initial value of the variants
const allVariantsReactive = ref(props.variants);
// the ref is stringified so i parse it to receive the full array
const allSelectedVariantsReactive = ref(JSON.parse(props.selectedObjects));
const initialSelectedObjects = ref(null);

onMounted(async () => {
  comboInput.value.addEventListener("click", showDropdown);
  // i set the input to be equal to the initially selected values (from the props)
  //comboInput.value.value = initialSelectedObjects.value;
});

// checking every little modification for the selected Objects and setting its reactive value to be equal to it
watch(
  () => JSON.parse(props.selectedObjects),
  (newValue) => {
    allSelectedVariantsReactive.value = newValue;
  }
);

watchEffect(() => {
  //while its still loading, i check if the initialselectedcategories received the prop corectly from the parent
  // and only then i set it
  if (
    props.selectedObjects &&
    props.selectedObjects.length > 0 &&
    loading.value
  ) {
    initialSelectedObjects.value = allSelectedVariantsReactive.value.join(", ");
    loading.value = false;
  }
});

watch(
  () => props.variants,
  (newVariants) => {
    //when the variants are updated, im updating the selected ones
    allVariantsReactive.value = newVariants;
  },
  { immediate: true }
);

// this watcher is for checking if the clear all button from the side panel is pressed
watch(
  () => props.clearAll,
  (newValue) => {
    if (newValue === true) {
      clearAllDropdownValues.value = true;
      setTimeout(() => {
        clearAllDropdownValues.value = false;
      }, 10);
    }
  }
);

// if the clear is true, we set every checkbox to unchecked
const isVariantSelected = (variant) => {
  if (!loading.value && !clearAllDropdownValues.value) {
    return allSelectedVariantsReactive.value.includes(variant);
  }
  if (clearAllDropdownValues.value) {
    allVariantsReactive.value = props.variants;
    comboInput.value.value = "";
    return false;
  }
};

const showDropdown = () => {
  isDropdownVisible.value = true;
};

const handleCheckboxChange = (event) => {
  const checkbox = event.target;
  const newValue = checkbox.checked;
  checkbox.checked = newValue;

  const checkboxes = dropdown.value.querySelectorAll('input[type="checkbox"]');
  const selectedVariants = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  allSelectedVariantsReactive.value = selectedVariants;

  emit("update:selectedOptions", selectedVariants);
};

const handleInputKeyPress = async (event) => {
  if (props.canAddInDropdown) {
    // this is used for checking if the variants can pe modified by pressing Enter or not
    let checkDuplicate = false; // this var is used for preventing creation of an existant category
    props.variants.forEach((variant) => {
      if (variant == event.target.value) {
        checkDuplicate = true;
      }
    });
    if (event.key === "Enter" && event.target.value !== "" && !checkDuplicate) {
      const newCategory = event.target.value.trim();
      props.variants.push(event.target.value);
      allVariantsReactive.value = props.variants;
      comboInput.value.value = "";
      isDropdownVisible.value = true;
      await nextTick(() => {
        // we set a small timeout because
        const checkboxes = dropdown.value.querySelectorAll(
          'input[type="checkbox"]'
        );
        const checkbox = dropdown.value.querySelector(
          `input[value="${newCategory}"]`
        );
        if (checkbox) {
          checkbox.checked = true;
          allSelectedVariantsReactive.value.push(newCategory);
        }
        const updatedSelectedVariants = Array.from(checkboxes)
          .filter((checkbox) => checkbox.checked)
          .map((checkbox) => checkbox.value);
        emit("update:selectedOptions", updatedSelectedVariants); // we use a small timeout since the reactive vars arent updating instanlty so we have to check the variant after we create it
      });
    }
    //here, we are checking if we press enter on those on the filter side
  } else {
    emit("filter-data");
  }
};

// filtering the search for the custom drop down for easier searches
const handleInputBoxChange = () => {
  const inputText = comboInput.value.value.toLowerCase(); // converting to lowercase so the search won't be case sensitive
  allVariantsReactive.value = props.variants.filter((variant) => {
    return variant.toLowerCase().startsWith(inputText);
  });
};

function onMouseEnter() {
  isDropdownVisible.value = true;
}

function onMouseLeave() {
  isDropdownVisible.value = false;
}

function getInputPlaceholder() {
  return props.inputPlaceholder;
}
</script>

<template>
  <div class="combo-box">
    <input type="text" ref="comboInput" class="input-dropdown" :placeholder="getInputPlaceholder()"
      :disabled="props.disabled" @keydown.enter="handleInputKeyPress" @input="handleInputBoxChange"
      @mouseleave="onMouseLeave" :style="{
        height: props.heightInVh ? props.heightInVh / 2 + 'vh' : {},
        width: props.widthInVw ? props.widthInVw + 'vw' : {},
      }" v-bind:style="error !== ''
    ? {
      'border-color': 'red',
      'background-color': 'rgb(255, 145, 153, 0.379)',
    }
    : { 'background-color': 'white' }
  " />
    <div v-show="isDropdownVisible && !props.disabled" class="dropdown" ref="dropdown" id="dropdown"
      @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" :style="{
        width: props.widthInVw ? props.widthInVw + 'vw' : {},
      }">
      <label v-if="allVariantsReactive && allVariantsReactive.length > 0" v-for="(variant, index) in allVariantsReactive"
        :key="index">
        <input type="checkbox" :value="variant" :checked="isVariantSelected(variant)" @change="handleCheckboxChange" />
        {{ variant }}
      </label>
      <div v-if="allVariantsReactive && allVariantsReactive.length === 0 && props.variants.length == 0" style="overflow: hidden;">
        <CustomLoader :size="30" />
      </div>
      <div v-if="allVariantsReactive && allVariantsReactive.length === 0 && props.variants.length > 0" style="overflow: hidden;">
        <span class="material-symbols-outlined">
          error
        </span>
        <div class="empty-list-text">Empty list!</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
  font-variation-settings:
  'FILL' 0,
  'wght' 400,
  'GRAD' 0,
  'opsz' 48;
  align-items: center;
  display: flex;
  justify-content: center;
  color: red;
}

.empty-list-text {
  align-items: center;
  display: flex;
  justify-content: center;
}
.combo-box {
  position: relative;
  display: inline-block;
}

.error {
  border-color: red;
  border-width: 1.4px;
  border-radius: 1px;
}

.error::placeholder {
  color: red;
}

.dropdown {
  position: absolute;
  top: 10;
  left: 1;
  background-color: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  max-height: 12vh;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 5px;
  border-radius: 3px;
  z-index: 2;
}

.dropdown::-webkit-scrollbar {
  display: block;
  height: 8px;
  cursor: pointer;
  width: 6px;
}

.dropdown::-webkit-scrollbar-thumb {
  background-color: #eb9224;
  border-radius: 5px;
  border: 1px solid slategray;
  cursor: pointer;
}

.dropdown label {
  cursor: pointer;
  display: flex;
  align-items: center;
  accent-color: #ffa941;
}

.input-dropdown {
  padding: 5px;
  box-sizing: border-box;
  border: 1px solid white;
  background-color: white;
  border-radius: 3px;
}

.input-dropdown:hover {
  border: 1px solid slategray;
}

*:focus {
  outline: none;
}
</style>
