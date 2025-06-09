<template>
  <div class="AI-page">
    <div class="AI-content">
      <div class="dashboard">
        <div class="chat-list"></div>
        <div class="chat-toolbar"></div>
      </div>
    </div>
    <div class="circle1"></div>
    <div class="circle2"></div>
    <div class="circle3"></div>
    <div class="circle4"></div>
  </div>
</template>
<script setup>

</script>
<style scoped>
.AI-page {
  position: relative;
  width: 100%;
  height: calc(100vh - 64px);
  display: flex;
  justify-content: center;
}
.AI-content {
  height: calc(100vh - 128px);
  max-height: 1000px;
  width: calc(100vh - 128px);
  max-width: 1000px;
  background: linear-gradient(
    to right bottom,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  border-radius: 2rem;
  z-index: 2;
  backdrop-filter: blur(2rem);
  display: flex;
  margin: auto;
}
.dashboard {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  text-align: center;
  background: linear-gradient(
    to right bottom,
    rgba(255, 255, 255, 0.7),
    rgba(255, 255, 255, 0.3)
  );
  border-radius: 2rem;
  padding: 2rem;
  box-sizing: border-box;
}

.circle1,
.circle2,
.circle3,
.circle4 {
  background: white;
  background: linear-gradient(
    to right bottom,
    rgba(255, 255, 255, 0.8),
    rgba(255, 255, 255, 0.3)
  );

  position: absolute;
  border-radius: 50%;
}

.circle1 {
  height: 20rem;
  width: 20rem;
  top: 10%;
  right: 5%;
}
.circle2 {
  height: 10rem;
  width: 10rem;
  bottom: 15%;
  left: 10%;
}
.circle3 {
  height: 15rem;
  width: 15rem;
  bottom: 0;
  left: 50%;
}
.circle4 {
  height: 10rem;
  width: 10rem;
  top: 0;
  right: 50%;
}
</style>