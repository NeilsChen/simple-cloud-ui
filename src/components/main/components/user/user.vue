<template>
  <div class="user-avator-dropdown">
    <Dropdown @on-click="handleClick">
      
      <Button type="text" size="large">
        <Avatar :src="userAvator" />
        {{this.$store.state.user.nickName}}
        {{this.$store.state.user.access}}
      </Button>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="userInfoDetail">个人信息</DropdownItem>
        <DropdownItem name="logout" divided>退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>
<script>
import './user.less'
import { mapActions } from 'vuex'
export default {
  name: 'User',
  props: {
    userAvator: {
      type: String,
      default: ''
    }
  },
  methods: {
    ...mapActions([
      'handleLogOut'
    ]),
    handleClick(name) {
      console.log(name);
      switch (name) {
        case 'logout':
          this.handleLogOut().then(() => {
            this.$router.push({
              name: 'login'
            })
          })
          break
        case 'userInfoDetail':
          this.$router.push({ name: 'ownspace' })
          break

      }
    }
  }
}

</script>
