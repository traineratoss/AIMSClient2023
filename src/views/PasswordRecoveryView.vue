<script setup>
import CompanyLogo from "../components/CompanyLogo.vue";
import CustomInput from "../components/CustomInput.vue";
import CustomButton from "../components/CustomButton.vue";
import { sendNewPassword } from "../services/user_service.js";
import { ref } from "vue";
import router from "../router";
import InvalidInputMessage from "../components/InvalidInputMessage.vue";
import FormTitle from "../components/FormTitle.vue";

const usernameOrEmailText = ref("");
const showErrorMessage = ref(false);
const errorMessage = ref("");

function requestNewPassword() {
  if (usernameOrEmailText.value.toLowerCase()) {
    sendNewPassword(usernameOrEmailText.value)
      .then((res) => {
        router.push("/login");
      })
      .catch((error) => {
        showErrorMessage.value = true;
        errorMessage.value = error.message;
      });
  } else {
    showErrorMessage.value = true;
    errorMessage.value = "The field must not be empty";
  }
}
</script>

<template>
  <CompanyLogo />
  <div class="container">
    <FormTitle 
      :label="'Password Recovery'"
    />
    <InvalidInputMessage
      :message="errorMessage"
      :class="{ 'error-message-visible': showErrorMessage }"
    />
    <div>
      <CustomInput
        type="text"
        id="username-email-input"
        placeholder="Username/E-mail"
        v-model:model-value="usernameOrEmailText"
        @keydown.enter="requestNewPassword"
      />
    </div>
    <div>
      <CustomButton 
        id="request-password" 
        @click="requestNewPassword"
        style="width: auto;"
      >
        Request new Password
      </CustomButton>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  position: relative;
  margin-top: 10vh;
}

.error-message-visible {
  opacity: 1;
}

.material-symbols-outlined {
  font-size: 10vh;
}

h1 {
  font-size: 30px;
}

#name {
  color: var(--selected-color);
  text-align: center;
}

img {
  padding: 10px;
  width: 150px;
}

input {
  padding: 5px;
  border: none;
}

button {
  padding: 5px;
  padding-right: 30px;
  padding-left: 30px;

  cursor: pointer;
}

#title {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#name {
  color: var(--selected-color);
}

.big-text {
  font-size: 30px;
}

#user-icon {
  font-size: 70px;
}
</style>
