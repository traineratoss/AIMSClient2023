<script setup>
import { ref } from "vue";


const props = defineProps({
  text: "",
  creationDate: "",
  userName: "",
  userId: "",
  ideaId: "",
  hasReplies: ""
});

const emits = defineEmits(['showReplies']);

let toggle = ref(false)

function showReplies(){
    console.log("Emit button was pressed from CustomComment")
    emits('showReplies')
} 


</script>

<template>
  <div class="comment-container">
    <p>
      <i>{{ props.userName }}</i>
    </p>
    <div class="item">{{ props.text }}</div>
    <div v-if="props.hasReplies">
        <button class="showReplies" @click="showReplies()">...</button>
    </div>
  
    <!-- <div class="reply-container" v-if="showReplies">
      <CustomComment :text='"TEST"' :userName='"test"' />
    </div> -->

  </div>
</template>

<style scoped>
.comment-container {
  background-color: rgb(255, 255, 255);
  border-radius: 2px;
  border: solid 1px black;
  margin: 5px;
  padding: 10px;
  max-width: 28vw;
}
.item {
  background-color: rgb(255, 255, 255);
  color: black;
}

.showReplies {
  position: relative;
  left:180px;
  top: 5px;
  font-size: xx-large;
  border: none;
  background-color: unset;
}

.reply-container {
  max-width: 25vw;
  position: relative;
  left: 40px;
  margin-bottom: 30px;
}
</style>