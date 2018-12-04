<template>
  <div>
    <Card>
      <p slot="title">
        <Icon type="person"></Icon>
        个人信息
      </p>
      <div>
        <Form ref="userForm" :model="userForm" :label-width="100" label-position="right" :rules="inforValidate">
          <FormItem label="用户头像" prop="avatorimg">
            <Row style="width:300px">
              <Col span="18">
              <img :src="userForm.avatorimg" height="200" width="200"></img>
              </Col>
              <Col span="6">
              <Upload :headers="headers" :show-upload-list="false" :format="['jpg','jpeg','png','gif']"
        :max-size="1048" :on-success="uploadSuccess" action="http://localhost:8088/admin-server/uploadAvator">
        		<Tooltip theme="light" placement="right">
	                <Button type="dashed" size="small">上传头像</Button>
	                <div slot="content">
			            <p>上传('jpg','png','gif')，1024kb以内图片</p>
			            <p>请尽量上传正方形图片作为头像！</p>
			        </div>
	            </Tooltip>
              </Upload>
              </Col>
            </Row>
          </FormItem>
          <FormItem label="登录账号" prop="username">
            <span>{{ userForm.username }}</span>
          </FormItem>
          <FormItem label="用户角色" prop="roleName">
            <span>{{ userForm.roleName }}</span>
          </FormItem>
          <FormItem label="登录密码">
            <Row style="width:300px">
              <Col span="6">
              <span>********</span>
              </Col>
              <Col span="18">
              <Button type="dashed" size="small" @click="showEditPassword">修改密码</Button>
              </Col>
            </Row>
          </FormItem>
          <FormItem label="用户昵称" prop="nickname">
            <div style="display:inline-block;width:300px;">
              <Input v-model="userForm.nickname" :disabled="dis.input"></Input>
            </div>
          </FormItem>
          <FormItem label="手 机 号" prop="cellphone">
            <div style="display:inline-block;width:300px;">
              <Input v-model="userForm.cellphone" :disabled="dis.input"></Input>
            </div>
          </FormItem>
          <FormItem label="用户邮箱" prop="email">
            <div style="display:inline-block;width:300px;">
              <Input v-model="userForm.email" :disabled="dis.input"></Input>
            </div>
          </FormItem>
          <FormItem label="用户性别" prop="gender">
            <RadioGroup v-model="userForm.gender" >
              <Radio v-for="item in genderList" :label='item.value' :disabled="dis.input">{{item.label}}</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="居住地址" prop="address">
            <div style="display:inline-block;width:300px;">
              <Input v-model="userForm.address" :disabled="dis.input"/>
            </div>
          </FormItem>
          <FormItem label="备注信息" prop="descn">
            <div style="display:inline-block;width:300px;">
              <Input v-model="userForm.descn" type="textarea" :autosize="{minRows: 2,maxRows: 5}" :disabled="dis.input"/>
            </div>
          </FormItem>
          <div style="padding-left:50px">
          	 <ButtonGroup>
	            <Button  style="width: 100px;" @click="cancelEditUserInfor">返回</Button>
	            <Button type="primary" :disabled="dis.editUserInfo" style="width: 100px;" @click="editUserInfo">编辑</Button>
	            <Button type="primary" :disabled="dis.saveEdit" style="width: 100px;" :loading="save_loading" @click="saveEdit">保存</Button>
             </ButtonGroup>
          </div>
        </Form>
      </div>
    </Card>
    <Modal v-model="editPasswordModal" :closable='false' :mask-closable=false :width="500">
      <h3 slot="header" style="color:#2D8CF0">修改密码</h3>
      <Form ref="editPasswordForm" :model="editPasswordForm" :label-width="100" label-position="right" :rules="passwordValidate">
        <FormItem label="原密码" prop="oldPass" :error="oldPassError">
          <Input type="password" v-model="editPasswordForm.oldPass" placeholder="请输入现在使用的密码"></Input>
        </FormItem>
        <FormItem label="新密码" prop="newPass">
          <Input type="password" v-model="editPasswordForm.newPass" placeholder="请输入新密码，至少6位字符"></Input>
        </FormItem>
        <FormItem label="确认新密码" prop="rePass">
          <Input type="password" v-model="editPasswordForm.rePass" placeholder="请再次输入新密码"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelEditPass">取消</Button>
        <Button type="primary" :loading="savePassLoading" @click="saveEditPass">保存</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import config from '@/config'
import { axFindUserById,axUpdatePassword,axUpdateUser } from '@/api/userinfo'
const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro;
export default {
  name: 'ownspace_index',
  data() {
    
    const validePhone = (rule, value, callback) => {
      var re = /^1[0-9]{10}$/;
      if (!re.test(value)) {
        callback(new Error('请输入正确格式的手机号！'));
      } else {
        callback();
      }
    };
    const valideRePassword = (rule, value, callback) => {
      if (value !== this.editPasswordForm.newPass) {
        callback(new Error('两次输入密码不一致！'));
      } else {
        callback();
      }
    };
    return {
      userForm: {
        id: ',',
        avator: '',
        avatorimg:require('@/assets/images/default-avator.jpg'),
        username: '',
        roleName: '',
        nickname: '',
        cellphone: '',
        email: '',
        gender: 1,
        address: '',
        descn: ''
      },
      dis:{
      	input:true,
      	editUserInfo:false,
      	saveEdit:true
      },
      headers:{
        Authorization:''
      },
      genderList: [{
        value: 1,
        label: '男'
      }, {
        value: 0,
        label: '女'
      }],

      save_loading: false,
      editPasswordModal: false, // 修改密码模态框显示
      savePassLoading: false,
      oldPassError: '',
      inforValidate: {
        nickname:[
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { max: 100, message: '最多输入100个字符', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        cellphone: [
          { validator: validePhone }
        ]
      },
      editPasswordForm: {
        oldPass: '',
        newPass: '',
        rePass: ''
      },
      passwordValidate: {
        oldPass: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
          { min: 6, message: '请至少输入6个字符', trigger: 'blur' }
        ],
        newPass: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '请至少输入6个字符', trigger: 'blur' },
          { max: 32, message: '最多输入32个字符', trigger: 'blur' }
        ],
        rePass: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { validator: valideRePassword, trigger: 'blur' }
        ]
      },
    };
  },
  methods: {

    showEditPassword() {
      this.editPasswordModal = true;
    },
    cancelEditUserInfor() {
      this.$router.go(-1)
    },
    editUserInfo(){
    	this.dis.input=false;
    	this.dis.editUserInfo=true;
    	this.dis.saveEdit=false;
    },
    saveEdit() {
      this.$refs['userForm'].validate((valid) => {
        if (valid) {
          let params = new URLSearchParams();
          params.append('data', JSON.stringify(this.userForm));
          axUpdateUser(params).then(res=>{
           if (res.data.code == 200) {
                this.$Notice.success({ desc: "用户修改成功！" });
                this.dis.input=true;
		    	this.dis.editUserInfo=false;
		    	this.dis.saveEdit=true;
              } else {
                this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
              }
            }).catch(error => {
              this.$Notice.error({ title: "错误提示", desc: error + "<br/>无法获取后台数据！" });
            });
        }
      });
    },
    cancelEditPass() {
		this.editPasswordForm.oldPass="";
		this.editPasswordForm.newPass="";
		this.editPasswordForm.rePass="";
      	this.editPasswordModal = false;
    },
    saveEditPass() {
      this.$refs['editPasswordForm'].validate((valid) => {
        if (valid) {
          this.savePassLoading = true;
          if(this.editPasswordForm.newPass == this.editPasswordForm.rePass){
			var params = new URLSearchParams();
	          params.append("uid",this.$store.state.user.userId);
	          params.append("oldPass",this.editPasswordForm.oldPass);
	          params.append("newPass",this.editPasswordForm.newPass);
	          axUpdatePassword(params).then(res=>{
	          	if (res.data.code == 200) {
	                this.$Notice.success({ desc: "密码修改成功！" });
	                this.userForm.password=this.editPasswordForm.newPass;
	                this.editPasswordModal=false;
	              } else {

	                this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
	              }
	            }).catch(err => {
	            	
	              this.$Notice.error({ title: "错误提示", desc: err + "<br/>无法获取后台数据！" });
	            });
          }else{
          	this.$Notice.error({ title: "错误提示：" , desc: "新密码与确认密码不一致，请重新输入！" });
          }
        }else{
        	this.$Notice.error({ title: "错误提示：" , desc: "请检查表单信息" });
        }
        this.savePassLoading=false;// 出现错误，提交按钮加载动画取消
      });
    },
    init() {
      this.headers.Authorization = "Bearer "+this.$store.state.user.token;
      let userId = this.$store.state.user.userId;
      axFindUserById(userId).then(res => {
        if (res.data.code == 200) {
        	 this.userForm=res.data.data;
        	 let avatorPath=res.data.data.avator;
        	 this.userForm.avatorimg = avatorPath?baseUrl+"admin-server/file/avator/"+avatorPath:require('@/assets/images/default-avator.jpg');
        } else {
          this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
        }
      }).catch(err => {
        this.$Notice.error({ title: "错误提示", desc: err + "<br/>无法获取后台数据！" });
      });
    },

    /**
     * 上传头像成功后触发
     * @return {[type]} [description]
     */
    uploadSuccess(response){
    	this.userForm.avator=response.data;
    	this.userForm.avatorimg=baseUrl+"admin-server/file/avator/"+response.data;
    	this.$store.commit("setAvator",response.data);// 调用store   mutations中的方法
    	this.init();
    }

  },
  mounted() {
    this.init();
  }
};

</script>
<style lang="less">
.own-space {
  &-btn-box {
    margin-bottom: 10px;
    button {
      padding-left: 0;
      span {
        color: #2D8CF0;
        transition: all .2s;
      }
      span:hover {
        color: #0C25F1;
        transition: all .2s;
      }
    }
  }
  &-tra {
    width: 10px;
    height: 10px;
    transform: rotate(45deg);
    position: absolute;
    top: 50%;
    margin-top: -6px;
    left: -3px;
    box-shadow: 0 0 2px 3px rgba(0, 0, 0, .1);
    background-color: white;
    z-index: 100;
  }
  &-input-identifycode-con {
    position: absolute;
    width: 200px;
    height: 100px;
    right: -220px;
    top: 50%;
    margin-top: -50px;
    border-radius: 4px;
    box-shadow: 0 0 2px 3px rgba(0, 0, 0, .1);
  }
}

</style>
