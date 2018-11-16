<template>
  <div>
    <Row>
      <Col span="24">
      <Card :dis-hover="true">
        <p slot="title">
          <Icon type="md-person"></Icon>
          用户列表
        </p>
        <Card style="padding-top:20px;" :padding="0">
          <Form ref="userSearchData" :model="userSearchData" style="margin:0px" inline>
            <FormItem label="帐号" prop="username" :label-width=50>
              <Input v-model="userSearchData.username" placeholder="帐号" />
            </FormItem>
            <FormItem label="名称" prop="nickname" :label-width=50>
              <Input type="text" v-model="userSearchData.nickname" placeholder="名称" />
            </FormItem>
            <FormItem label="手机号" prop="cellphone" :label-width=50>
              <Input type="text" v-model="userSearchData.cellphone" placeholder="手机号" />
            </FormItem>
            <FormItem label="性别" prop="gender" :label-width=50>
              <Select v-model="userSearchData.gender" clearable style="width:70px">
                <Option v-for="item in genderList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </FormItem>
            <FormItem label="状态" prop="status" :label-width=50>
              <Select v-model="userSearchData.status" clearable style="width:70px">
                <Option v-for="item in statusList" :value="item.value" :key="item.value" :disabled="item.disabled">{{ item.label }}</Option>
              </Select>
            </FormItem>
            <FormItem>
              <span style="padding-left:50px;" />
              <Button type="primary" @click="handleSearchUser" icon="md-search">搜索</Button>
            </FormItem>
            <FormItem>
              <Button @click="handleCancelUser('userSearchData')" icon="md-refresh">重置</Button>
            </FormItem>
          </Form>
        </Card>
        <Card style="margin-top:10px;">
          <Row type="flex" justify="start">
            <ButtonGroup size="large">
              <Button icon="md-add" @click="addUser">添加</Button>
              <Button icon="md-settings" @click="editUserRole" :disabled="canEditUserRole">修改用户角色</Button>
              <Button icon="md-close" @click="deleteUser" :disabled="canDelete">删除</Button>
            </ButtonGroup>
            <span style="margin-left:10px;" />
            <ButtonGroup size="large">
              <Button icon="md-refresh" @click="refreshTable">刷新</Button>
              <Button icon="md-reorder" @click="showUserColumns">显示列</Button>
            </ButtonGroup>
          </Row>
        </Card>
        <Card style="margin-top:10px;" :padding="0" :bordered="false">
          <Row>
            <Table height="520" :loading="loading" :columns="userColumn" :data="userData" border stripe @on-selection-change="selectionChange"></Table>
          </Row>
          <Row type="flex" justify="center">
            <Page style="margin:10px;" :total="pageInfo.totalPages" :current="pageInfo.currentPage" :page-size="pageInfo.pageSize" :page-size-opts="pageInfo.pageSizeOpt" @on-change="changePage" @on-page-size-change="changeSize" show-elevator show-sizer show-total placement="top"></Page>
          </Row>
        </Card>
      </Card>
      </Col>
    </Row>
    <!-- :loading="userModalLoading" ok-text="提交" cancel-text="取消" @on-ok="userModalSubmit('userFormItem')" @on-cancel="userModalCancel('userFormItem')" -->
    <Modal :title="userFormItem.modalTitle" v-model="addUserModal" :closable="false" :mask-closable="false"  :loading="userModalLoading" ok-text="提交" cancel-text="取消" @on-ok="userModalSubmit('userFormItem')" @on-cancel="userModalCancel('userFormItem')">
      <Form ref="userFormItem" :model="userFormItem" :rules="userRuleValidate" :label-width=80>
        <FormItem label="帐号" prop="username">
          <Input v-model="userFormItem.username" :disabled="userFormItem.nameDisable" placeholder="输入登录帐号..." />
        </FormItem>
        <FormItem label="姓名" prop="nickname">
          <Input v-model="userFormItem.nickname" placeholder="输入用户名称..." />
        </FormItem>
        <FormItem label="手机号" prop="cellphone">
          <Input v-model="userFormItem.cellphone" placeholder="输入手机号..." />
        </FormItem>
        <FormItem label="邮箱" prop="email">
          <Input v-model="userFormItem.email" placeholder="输入邮箱..." />
        </FormItem>
        <FormItem label="地址" prop="address">
          <Input v-model="userFormItem.address" placeholder="输入居住地址..." />
        </FormItem>
        <FormItem label="出生日期" prop="birthday">
          <Row>
            <Col span="11">
            <DatePicker type="date" format="yyyy-MM-dd" placeholder="选择日期" @on-change="userFormItem.birthday=$event" value="userFormItem.birthday" />
            </Col>
          </Row>
        </FormItem>
        <FormItem label="性别" prop="gender">
          <RadioGroup v-model="userFormItem.gender">
            <Radio v-for="item in genderList" :label='item.value'>{{item.label}}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="用户状态" prop="status">
          <Select v-model="userFormItem.status">
            <Option v-for="item in statusList" :value="item.value" :key="item.value" :disabled="item.disabled">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="备注" prop="descn">
          <Input v-model="userFormItem.descn" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="备注信息..." />
        </FormItem>
      </Form>
      <!-- <div slot="footer">
        <Button type="text" size="large" @click="userModalCancel('userFormItem')">取消</Button>
        <Button type="primary" size="large" @click="userModalSubmit('userFormItem')">确定</Button>
      </div> -->
    </Modal>

    <Modal title="修改用户角色" v-model="roleModal" :closable="false" :mask-closable="false" ok-text="提交" cancel-text="取消" @on-ok="roleModalSubmit()" @on-cancel="roleModalCancel()">
      <Form :rules="roleRuleValidate" ref="roleFormItem" :model="roleFormItem">
        <FormItem prop="roleList">
          <CheckboxGroup v-model="roleFormItem.roleList">
            <Checkbox v-for="item in roleFormItem.allRoles" :label="item.id">{{item.name}}&nbsp;&nbsp;({{item.descn}})&nbsp;&nbsp;</Checkbox>
          </CheckboxGroup>
        </FormItem>
        <!--  {{this.roleFormItem.roleList}} -->
      </Form>
    </Modal>
  </div>
</template>
<script>

import { axFindUsersWithPaging, axAddUser, axUpdateUser, axDeleteUser } from '@/api/userinfo'
import { axFindAllRoles } from '@/api/roleinfo'
export default {
  name: "userinfo-table",

  data() {
    return {

      userColumn: [{
          type: "selection",
          width: 60,
          align: "center",
          fixed: "left"
        },
        {
          type: "ind",
          title: "序号",
          width: 65,
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.index +
              (this.pageInfo.currentPage - 1) * this.pageInfo.pageSize +
              1
            );
          }
        },
        {
          key: "username",
          title: "帐号",
          align: "center",
          width: 200
        },
        {
          key: "nickname",
          title: "名称",
          align: "center",
          width: 200
        },
        {
          key: "email",
          title: "邮箱",
          align: "center",
          width: 200
        },
        {
          key: "cellphone",
          title: "电话号码",
          align: "center",
          width: 200
        },
        {
          key: "gender",
          title: "性别",
          align: "center",
          width: 100,
          render: (h, params) => {
            const row = params.row;
            const color =
              row.gender === 1 ? "blue" : row.gender === 0 ? "red" : "black";
            const text =
              row.gender === 1 ? "男" : row.gender === 0 ? "女" : "空";
            return h(
              "Tag", {
                props: {
                  type: "border",
                  color: color
                }
              },
              text
            );
          }
        },
        {
          key: "address",
          title: "居住地址",
          align: "center",
          width: 200
        },
        {
          key: "birthday",
          title: "生日",
          align: "center",
          width: 200
        },
        {
          key: "status",
          title: "启用状态",
          align: "center",
          width: 100,
          render: (h, params) => {
            let texts = "空值";
            let color = "black";
            if (params.row.status == 0) {
              texts = "未启用";
              color = "yellow";
            } else if (params.row.status == 1) {
              texts = "正常";
              color = "green";
            } else if (params.row.status == 2) {
              texts = "禁用";
              color = "red";
            } else if (params.row.status == 3) {
              texts = "删除";
              color = "gray";
            }
            // return h('div',{props: {}},texts);
            return h(
              "Tag", {
                props: {
                  type: "border",
                  color: color
                }
              },
              texts
            );
          }
        },
        {
          key: "roleName",
          title: "用户角色",
          align: "center",
          width: 150,
          render: (h, params) => {
            if (params.row.roleName) {
              let rolearr = params.row.roleName.split(",");
              var tags = [];
              tags.push(h('Tag', { props: { type: "border" } }, rolearr[0]));
              if (rolearr.length > 1) {
                tags.push(h('Tag', { props: { type: "border" } }, "..."));
              }
              // for (var i = 0; i < rolearr.length; i++) {
              //   tags.push(h('Tag',{props:{type:"border"}},rolearr[i]));
              // }
              return h('div', tags);
            }
          }
        },
        {
          key: "createTime",
          title: "创建时间",
          align: "center",
          width: 150,
          render: function(h, params) {
            return h(
              "div",
              params.row.createTime == null ?
              "" :
              new Date(params.row.createTime).format("yyyy-MM-dd hh:mm:ss")
            );
          }
        },
        {
          key: "updateTime",
          title: "最后更新时间",
          align: "center",
          width: 150,
          render: function(h, params) {
            return h(
              "div",
              params.row.updateTime == null ?
              "" :
              new Date(params.row.updateTime).format("yyyy-MM-dd hh:mm:ss")
            );
          }
        },
        {
          key: "descn",
          title: "备注信息",
          align: "center",
          width: 150
        },
        {
          title: "操作",
          key: "action",
          width: 150,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            return h("div", [
              h(
                "Button", {
                  props: {
                    type: "primary",
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.editUser(params);
                    }
                  }
                },
                "修改"
              ),
              h(
                "Button", {
                  props: {
                    type: "error",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.deleteUser(params, true);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],

      userData: [],

      statusList: [{
          value: 0,
          label: '不启用'
        },
        {
          value: 1,
          label: '正常'
        },
        {
          value: 2,
          label: '禁用'
        }
        // ,
        // {
        //   value: 3,
        //   label: '删除',
        //   disabled:true
        // }
      ],
      genderList: [{
        value: 1,
        label: '男'
      }, {
        value: 0,
        label: '女'
      }],
      userSearchData: {
        username: "",
        nickname: "",
        status: 1,
        gender: null,
        cellphone: ""
      },

      pageInfo: {
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        pageSizeOpt: [10, 20, 30, 50]
      },
      value1: [1, 2],

      addUserModal: false,
      roleModal: false,

      userFormItem: {
        modalTitle: "",
        modalSubmitType: "",
        nameDisable: false,
        id: "",
        username: "",
        nickname: "",
        email: "",
        cellphone: "",
        address: "",
        gender: 1,
        status: 1,
        birthday: "",
        descn: ""
      },
      roleFormItem: {
        roleList: [],
        allRoles: []
      },
      userRuleValidate: {
        username: [
          { required: true, message: "帐号不能为空", trigger: "blur" }
        ],
        nickname: [
          { required: true, message: "姓名不能为空", trigger: "blur" }
        ],
        email: [{ type: "email", message: "邮箱格式错误", trigger: "blur" }]
      },

      roleRuleValidate: {
        roleList: [
          { required: true, type: 'array', min: 1, message: '最少选择一个角色', trigger: 'change' },
          { type: 'array', max: 5, message: '最多选择五个角色', trigger: 'change' }
        ]
      },

      loading: true,
      userModalLoading: true,
      userTableSelectData: [],
      canEditUserRole: true,
      canDelete: true
    };
  },
  methods: {
    init() {
      //加载所有角色
      //this.initRoles();
    },
    changePage(page) {
      this.pageInfo.currentPage = page;
      this.refreshTable();
    },
    changeSize(size) {
      this.pageInfo.pageSize = size;
      this.refreshTable();
    },
    refreshTable() {
      this.loading = true;
      var data = {
        username: this.userSearchData.username,
        nickname: this.userSearchData.nickname,
        gender: this.userSearchData.gender,
        cellphone: this.userSearchData.cellphone,
        status: this.userSearchData.status,
        currentPage: this.pageInfo.currentPage,
        pageSize: this.pageInfo.pageSize
      };
      var token = "123";

      // axios-查询用户数据
      axFindUsersWithPaging({ data, token }).then(res => {
        this.pageInfo.totalPages = res.data.data.total;
        this.userData = res.data.data.list;
        this.loading = false;
      }).catch(err => {
        this.$Notice.error({
          title: "错误提示",
          duration: 5,
          desc: err + "<br/>无法获取后台数据！"
        });
        this.loading = false;
      });
    },

    //查询角色
    initRoles() {
      this.roleFormItem.roleList = [];
      var selectUser = this.userTableSelectData;
      let userId = null;
      if (selectUser.length == 1) {
        userId = selectUser[0].id;
      }
      var data = { "userId": userId };
      var token = "123";

      //axios-查询用户角色
      axFindAllRoles({ data, token }).then(res => {
        this.roleFormItem.allRoles = res.data.data.allRole;
        this.roleFormItem.roleList = res.data.data.userRole;
      }).catch(err => {
        this.$Notice.error({
          title: "错误提示",
          duration: 5,
          desc: err + "<br/>无法获取后台数据！"
        });
      });
    },

    handleSearchUser() {
      this.refreshTable();
    },
    handleCancelUser(name) {
      this.$refs[name].resetFields();
    },

    addUser() {
      this.userFormItem = {};
      this.userFormItem.gender = 1;
      this.userFormItem.status = 1;
      this.userFormItem.modalTitle = "添加用户";
      this.userFormItem.modalSubmitType = "add";
      this.userFormItem.nameDisable = false;
      this.addUserModal = true;
    },
    editUser(rowdata) {
      this.userFormItem = rowdata.row;
      this.userFormItem.nameDisable = true;
      this.userFormItem.modalTitle = "修改用户";
      this.userFormItem.modalSubmitType = "edit";
      this.addUserModal = true;
    },
    deleteUser(data, isbatch) {
      if (isbatch) {
        this.userTableSelectData = [];
        this.userTableSelectData[0] = data.row;
      }
      if (this.userTableSelectData.length > 0) {
        this.$Modal.confirm({
          title: "提示",
          content: "<h2>确定删除用户信息？</h2>",
          onOk: () => {
            let ids = "";
            for (var i = 0; i < this.userTableSelectData.length; i++) {
              if (i > 0) {
                ids = ids + ","
              }
              ids = ids + this.userTableSelectData[i].id;
            }


            let params = new URLSearchParams();
            params.append('data', ids);
            params.append('token', '123');

            //axios-删除用户
            axDeleteUser(params).then(res => {
              this.$Notice.success({
                // title: '提示消息',
                duration: 3,
                desc: "删除用户成功！"
              });
              this.refreshTable();
              this.$Loading.finish();
            }).catch(err => {
              this.$Notice.error({
                title: "错误提示",
                duration: 5,
                desc: err + "<br/>无法获取后台数据！"
              });
              this.loading = false;
            });
          }
        });
      }
    },
    //修改用户角色
    editUserRole() {
      this.initRoles();
      this.roleModal = true;
    },
    showUserColumns() {},
    //添加用户
    userModalSubmit(name) {

      this.$refs[name].validate(valid => {
        if (valid) {

          let params = new URLSearchParams();
          params.append('data', JSON.stringify(this.userFormItem));
          params.append('token', '123');

          if (this.userFormItem.modalSubmitType == "add") {
            axAddUser(params).then(res => {
              if (res.data.code == 200) {
                this.$Notice.success({
                  // title: '提示消息',
                  duration: 3,
                  desc: "用户添加成功！"
                });
                this.refreshTable();
                this.$refs[name].resetFields();
                this.loading = false;
                this.addUserModal=false;
              } else {
                this.$Modal.error({
                  width: 650,
                  title: "错误提示",
                  content: "<p style='text-align:left;color:red;font-size:20px;word-wrap:break-word; word-break:normal;'>错误代码： " + res.data.code +
                    " </p><p style='font-size:14px;word-wrap:break-word; word-break:normal;'>详细内容：" + res.data.message + "</p>"
                });
                this.loading = false;
                this.addUserModal=false;
              }
            }).catch(error => {
              this.$Notice.error({ title: "错误提示", duration: 5, desc: error + "<br/>无法获取后台数据！" });
              this.loading = false;
              this.addUserModal=false;
            });
            //修改用户
          } else if (this.userFormItem.modalSubmitType == "edit") {
            axUpdateUser(params).then(res => {
                if (res.data.code == 200) {
                  this.$Notice.success({
                    // title: '提示消息',
                    duration: 3,
                    desc: "用户修改成功！"
                  });
                  this.refreshTable();
                  this.$refs[name].resetFields();
                  this.loading = false;
                  this.addUserModal=false;
                }
                if (res.data.code == 500) {
                  this.$Modal.error({
                    width: 650,
                    title: "错误提示",
                    content: "<p style='text-align:left;color:red;font-size:20px;word-wrap:break-word; word-break:normal;'>错误代码： " +
                      res.data.code +
                      " </p><p style='font-size:14px;word-wrap:break-word; word-break:normal;'>详细内容：" +
                      res.data.message +
                      "</p>"
                  });
                  this.loading = false;
                  this.addUserModal=false;
                }
              })
              .catch(error => {
                this.$Notice.error({
                  title: "错误提示",
                  duration: 5,
                  desc: error + "<br/>无法获取后台数据！"
                });
                this.loading = false;
                this.addUserModal=false;
              });
          } else {
            this.$Message.error("Fail!  DATA ERROR!!!");
          }
        } else {
          setTimeout(() => {
            this.userModalLoading = false;
            this.loading = false;
            this.$nextTick(() => {
              this.userModalLoading = true;
            });
          }, 1000);
          this.$Message.error({
            content: '请检查表单填写信息!',
            duration: 3
          });
        }
      });

      //清除验证
      this.$refs[name].resetFields();
    },
    userModalCancel(name) {
      this.$refs[name].resetFields();
      if (this.userFormItem.modalSubmitType == "edit") {
        this.refreshTable();
      }
      this.addUserModal=false;
    },
    selectionChange(selection) {
      if (selection.length == 0) {
        this.canEditUserRole = true;
        this.canDelete = true;
      } else if (selection.length >= 1) {
        this.canEditUserRole = false;
        this.canDelete = false;
      }
      this.userTableSelectData = selection;
    },
    //修改用户角色信息
    roleModalSubmit() {
      var userids = [];
      for (var i = 0; i < this.userTableSelectData.length; i++) {
        userids[i] = this.userTableSelectData[i].id;
      }
      var data = {
        userId: userids,
        roleId: this.roleFormItem.roleList
      };

      let postData = this.$qs.stringify({
        data: JSON.stringify(data),
        token: "123"
      });

      this.$axios
        .post("/admin-server/user/updateUserRole", postData)
        .then(res => {
          console.log(res);
          if (res.data.code == 200) {
            this.$Notice.success({
              // title: '提示消息',
              duration: 3,
              desc: "修改用户角色成功！"
            });
            this.refreshTable();
            this.$Loading.finish();
          } else {
            this.$Modal.error({
              width: 650,
              title: "错误提示",
              content: "<p style='text-align:left;color:red;font-size:20px;word-wrap:break-word; word-break:normal;'>500 " +
                res.data.msg +
                " </p><p style='font-size:14px;word-wrap:break-word; word-break:normal;'>详细内容：" +
                res.data.data +
                "</p>"
            });
            this.$Loading.error();
          }
        });
    },

    roleModalCancel() {

    }
  },
  mounted() {
    this.$Loading.start();

    this.init();
    this.refreshTable();

    this.$Loading.finish();
  }
};

</script>
