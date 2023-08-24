<script setup>
import { ref, defineProps, defineEmits } from "vue";
import {
  sendActivateEmail,
  sendApproveEmail,
  sendDeactivateEmail,
  sendDeclineEmail,
  updateUser,
  updateUserRole,
  getCurrentUsername
} from "../services/user_service";
import UserApproveDeclineModal from "./UserApproveDeclineModal.vue";

const props = defineProps({
  name: String,
  userRole: String,
  isActive: Boolean,
  hasPassword: Boolean,
});

const showPopup = ref(false);
const popupMessage = ref('');
const role = ref(props.userRole);
const emit = defineEmits(["activation-successful", "deactivation-successful", 'multiple-admin-action']);
const showOptions = ref(false);

async function changeStatus() {
  if (!props.isActive) {
    try {
      await sendActivateEmail(props.name);
      emit("change-status-successful", props.name);
    } catch (error) {
      popupMessage.value = error.message;
      showPopup.value = true;
      console.log("Error!", error);
    }
  } else {
    try {
      await sendDeactivateEmail(props.name);
      emit("change-status-successful", props.name);
    } catch (error) {
      popupMessage.value = error.message;
      showPopup.value = true;
      console.log("Error!", error);
    }
  }
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


function approveUser() {
  sendApproveEmail(props.name)
    .then((res) => {
      emit("approve-user", props.name);
      role.value = "STANDARD";
    })
    .catch((error) => {
      popupMessage.value = error.message;
      showPopup.value = true;
      console.log("Error!", error);
    });
}

function declineUser() {
  sendDeclineEmail(props.name)
    .then((res) => {
      emit("decline-user", props.name);
    })
    .catch((error) => {
      popupMessage.value = error.message;
      showPopup.value = true;
      console.log("Error!", error);
    });
}

function changeRole() {
  updateUserRole(props.name)
    .then((res) => {
      emit("update-role", props.name);
    })
    .catch((error) => {
      console.log("Error!", error);
    });
}

function handleOK() {
  showPopup.value = false;
  emit('multiple-admin-action');
}
</script>

<template>
  <div 
    class="user"
    @click="hasPassword ? showOptions=!showOptions : showOptions"
  >
    <div class="username-container" >
      <div class="animation-container" :class="{isSelected: showOptions}"></div>
      <span>
        {{ getShortText(name, 1, 40) }}
      </span>
    </div>
    <div class="user-options"
      v-if="!hasPassword || showOptions"
    >
      <button v-if="!hasPassword && !isActive" @click="approveUser">
        Approve
      </button>
      <button v-if="!hasPassword && !isActive" @click="declineUser">
        Decline
      </button>
      <select 
        v-model="role" 
        @change="changeRole" 
        @click.stop 
        v-if="hasPassword"
        :disabled="(getCurrentUsername() === name)"
        >
        <option selected>{{ userRole == "" ? "STANDARD" : userRole }}</option>
        <option value="STANDARD" v-if="userRole != 'STANDARD'">STANDARD</option>
        <option value="ADMIN" v-if="userRole != 'ADMIN'">ADMIN</option>
      </select>
      <Teleport to="body">
          <UserApproveDeclineModal
            :message="popupMessage"
            :show="showPopup"
            @ok="handleOK"
          />
      </Teleport>
      <button
        id="activate-or-deactivate"
        @click.stop="changeStatus"
        v-if="hasPassword"
        :disabled="(getCurrentUsername() === name)"
      >
        {{ isActive ? "Deactivate" : "Activate" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.user {
  background-color: white;
  width: 60vw;
  display: flex;
  justify-content: space-between;
  padding: 8px;
  cursor: pointer;
}

.user-options {
  display: flex;
  gap: 15px;
}

#activate-or-deactivate {
  text-decoration: underline;
  width: 6vw;
  background-color: transparent;
  border: none;
  padding-left: 5px;
  padding-right: 5px;
}

#activate-or-deactivate:hover,
button {
  cursor: pointer;
}

button {
  padding-left: 10px;
  padding-right: 10px;
}

select {
  width: 5vw;
}

.username-container {
  width: 50vw;
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.animation-container {
  background-color: initial;
  border-radius: 15px;
  width: 0.2vw;
  transition: background-color 0.3s;
}

.user:hover .animation-container {
  background-color: var(--selected-color);
}

.isSelected{
  background-color: var(--selected-color);
  
}
</style>