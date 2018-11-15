<template>
  <div>
    <Row>
      <Col span="24">
      <Card :dis-hover="true">
        <p slot="title">
          <Icon type="md-people"></Icon>
          角色列表
        </p>
        <Card style="padding-top:20px;" :padding="0">
          <Form ref="searchData" :model="searchData" :rules="searchData" style="margin:0px" inline>
            <FormItem label="名称" prop="name" :label-width=50>
              <Input type="text" v-model="searchData.name" placeholder="名称"  />
            </FormItem>
            <FormItem label="备注信息" prop="descn" :label-width=70>
              <Input v-model="searchData.descn" placeholder="备注信息" />
            </FormItem>
            <FormItem label="状态" prop="status" :label-width=50>
              <Select v-model="searchData.status" clearable style="width:70px">
                <Option value='0'>不启用</Option>
                <Option value='1' checked>正常</Option>
                <Option value='2'>禁用</Option>
                <Option value='3'>删除</Option>
              </Select>
            </FormItem>
            <span style="padding-left:50px;" />
            <FormItem>
              <Button type="primary" @click="searchSubmit" icon="md-search">搜索</Button>
            </FormItem>
            <FormItem>
              <Button @click="searchReset('searchData')" icon="md-refresh">重置</Button>
            </FormItem>
          </Form>
        </Card>
        <Card style="margin-top:10px;">
          <Row type="flex" justify="start">
            <ButtonGroup size="large">
              <Button icon="md-add" @click="addData">添加</Button>
              <Button icon="md-close" @click="deleteData" :disabled="canDelete">删除</Button>
              
            </ButtonGroup>
            <span style="margin-left:10px;" />
            <ButtonGroup size="large">
              <Button icon="md-refresh" @click="refreshTable">刷新</Button>
              <!-- <Button  icon="md-reorder" @click="tableSelectData">显示列</Button> -->
            </ButtonGroup>
          </Row>
        </Card>
        <Card style="margin-top:10px;" :padding="0" :bordered="false">
          <Row>
            <Table height="520" :loading="loading" :columns="tableColumn" :data="tableData" border stripe @on-selection-change="selectionChange"></Table>
          </Row>
          <Row type="flex" justify="center">
            <Page style="margin:10px;" :total="pageInfo.totalPages" :current="pageInfo.currentPage" :page-size="pageInfo.pageSize" :page-size-opts="pageInfo.pageSizeOpt" @on-change="changePage" @on-page-size-change="changeSize" show-elevator show-sizer show-total placement="top"></Page>
          </Row>
        </Card>
      </Card>
      </Col>
    </Row>
    <Modal :title="modalFormItem.modalTitle" v-model="addModal" :closable="false" :mask-closable="false" :loading="modalLoading" ok-text="提交" cancel-text="取消" @on-ok="modalSubmit('modalFormItem')" @on-cancel="modalCancel('modalFormItem')">
      <Form ref="modalFormItem" :model="modalFormItem" :rules="formRuleValidate" :label-width=80>
        <FormItem label="名称" prop="name">
          <Input v-model="modalFormItem.name" placeholder="名称..." />
        </FormItem>
        <FormItem label="用户状态" prop="status">
          <Select v-model="modalFormItem.status">
            <Option value='0'>不启用</Option>
            <Option value='1'>正常</Option>
            <Option value='2'>禁用</Option>
            <Option value='3' disabled>删除</Option>
          </Select>
        </FormItem>
        <FormItem label="备注" prop="descn">
          <Input v-model="modalFormItem.descn" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="备注信息..." />
        </FormItem>
      </Form>
    </Modal>

    <Modal title="关联资源" v-model="resourceModal" :closable="false" :mask-closable="false" :loading="modalLoading2" ok-text="提交" cancel-text="取消" @on-ok="resModalSubmit()" @on-cancel="modalCancel()" width=600>
        <resource-tree ref="restree" :roleId="treedata.roleId"></resource-tree>
    </Modal>

  </div>
</template>
<script>
import resourceTree from "./resource-tree"

export default {
  name: "roleinfo-table",
  components: {
    resourceTree
  },
  data() {
    return {

      tableColumn: [{
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
              (this.pageInfo.currentPage - 1) * this.pageInfo.pageSize + 1
            );
          }
        },
        {
          key: "name",
          title: "名称",
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
          width: 200,
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
                   style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.deleteUser(params, true);
                    }
                  }
                },
                "删除"
              ),
              h(
                "Button", {
                  props: {
                    type: "default",
                    size: "small"
                  },
                  on: {
                    click: () => {
                      this.updatePermission(params);
                    }
                  }
                },
                "关联资源"
              )
            ]);
          }
        }
      ],

      tableData: [
        {
          id:1,
          name:"cs1",
          status:1,
          createTime:null,
          updateTime:null,
          descn:"ccccsssss1"
        },{
          id:2,
          name:"cs2",
          status:2,
          createTime:null,
          updateTime:null,
          descn:"ccccsssss2"
        }
      ],

      searchData: {
        name: "",
        descn: "",
        status: 1
      },

      pageInfo: {
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        pageSizeOpt: [10, 20, 30, 50]
      },
      value1: [1, 2],

      addModal: false,
      resourceModal:false,

      modalFormItem: {
        modalTitle: "",
        modalSubmitType: "",
        id: "",
        name: "",
        status: 1,
        descn: ""
      },

      formRuleValidate: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ]
      },

      treedata:{
        roleId:0
      },

      loading: true,
      modalLoading: true,
      modalLoading2:true,
      tableSelectData: [],
      canDelete: true
    };
  },
  methods: {
    init() {

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
        name: this.searchData.name,
        descn: this.searchData.descn,
        status: this.searchData.status,
        currentPage: this.pageInfo.currentPage,
        pageSize: this.pageInfo.pageSize
      };
      var token = "";
      this.$axios.get("/admin-server/role/findRolesWithPaging", {
          params: { data: data, token: token }
        })
        .then(res => {
          this.pageInfo.totalPages = res.data.data.total;

          this.tableData = res.data.data.list;

          this.loading = false;
        })
        .catch(error => {
          this.$Notice.error({
            title: "错误提示",
            duration: 5,
            desc: error + "<br/>无法获取后台数据！"
          });

          this.loading = false;
        });
    },

    searchSubmit() {
      this.refreshTable();
    },
    searchReset(name) {
      this.$refs[name].resetFields();
    },

    //添加记录
    addData() {
      this.modalFormItem = {};
      this.modalFormItem.gender = 1;
      this.modalFormItem.status = 1;
      this.modalFormItem.modalTitle = "添加角色";
      this.modalFormItem.modalSubmitType = "add";
 
      this.addModal = true;
    },
    //修改记录
    editUser(rowdata) {
      this.modalFormItem = rowdata.row;

      this.modalFormItem.modalTitle = "修改角色";
      this.modalFormItem.modalSubmitType = "edit";
      this.addModal = true;
    },
    //删除记录 
    deleteData(data, isbatch) {
      if (isbatch) {
        this.tableSelectData = [];
        this.tableSelectData[0] = data.row;
      }
      if (this.tableSelectData.length > 0) {
        this.$Modal.confirm({
          title: "提示",
          content: "<h2>确定删除角色信息？</h2>",
          onOk: () => {
            let ids = new Array();
            for (var i = 0; i < this.tableSelectData.length; i++) {
              ids[i] = this.tableSelectData[i].id;
            }

            let postData = this.$qs.stringify({
              data: JSON.stringify(ids),
              token: "123"
            });

            this.$axios
              .post("/admin-server/role/deleteRole", postData)
              .then(res => {
                if (res.data.code == 200) {
                  this.$Notice.success({
                    // title: '提示消息',
                    duration: 3,
                    desc: "删除角色成功！"
                  });
                  this.refreshTable();
                  this.$Loading.finish();
                }
                if (res.data.code == 500) {
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
          }
        });
      }
    },
    //提交表单
    modalSubmit(name) {

      this.$Loading.start();
      this.$refs[name].validate(valid => {
        if (valid) {
          let postData = this.$qs.stringify({
            data: JSON.stringify(this.modalFormItem),
            token: "123"
          });

          //添加用户
          if (this.modalFormItem.modalSubmitType == "add") {
            this.$axios
              .post("/admin-server/user/addUser", postData)
              .then(res => {
                if (res.data.code == 200) {
                  this.$Notice.success({
                    // title: '提示消息',
                    duration: 5,
                    desc: "角色添加成功！"
                  });
                  this.refreshTable();
                  this.$refs[name].resetFields();
                  this.$Loading.finish();
                }
                if (res.data.code == 500) {
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
              })
              .catch(error => {
                this.$Notice.error({
                  title: "错误提示",
                  duration: 10,
                  desc: error + "<br/>无法获取后台数据！"
                });

                this.loading = false;
              });

            //修改用户
          } else if (this.modalFormItem.modalSubmitType == "edit") {
            this.$axios
              .post("/admin-server/user/updateUser", postData)
              .then(res => {
                if (res.data.code == 200) {
                  this.$Notice.success({
                    // title: '提示消息',
                    duration: 5,
                    desc: "角色修改成功！"
                  });
                  this.refreshTable();
                  this.$refs[name].resetFields();
                  this.$Loading.finish();
                }
                if (res.data.code == 500) {
                  this.$Modal.error({
                    width: 650,
                    title: "错误提示",
                    content: "<p style='text-align:left;color:red;font-size:20px;word-wrap:break-word; word-break:normal;'>500 " +
                      res.data.msg +
                      " </p><p style='font-size:14px;word-wrap:break-word; word-break:normal;'>详细内容：" +
                      res.data.data + "</p>"
                  });
                  this.$Loading.error();
                }
              })
              .catch(error => {
                this.$Notice.error({
                  title: "错误提示",
                  duration: 10,
                  desc: error + "<br/>无法获取后台数据！"
                });
                this.loading = false;
              });
          } else {
            this.$Message.error("Fail!  DATA ERROR!!!");
          }
        } else {
          setTimeout(() => {
            this.modalLoading = false;
            this.$nextTick(() => {
              this.modalLoading = true;
            });
          }, 1000);
          this.$Message.error({
            content:'请检查表单填写信息!',
            duration:3
          });
        }
      });
    },
    modalCancel(name) {
      //this.$refs[name].resetFields();
    },

    resModalSubmit(){

    },

    //角色关联资源
    updatePermission(data){
      var roleid = data.row.id;
      this.treedata.roleId=roleid;
      this.$refs.restree.findNodes(roleid);
      this.resourceModal=true;

    },

    selectionChange(selection) {
      if (selection.length == 0) {
        this.canDelete = true;
      } else if (selection.length >= 1) {
        this.canDelete = false;
      }
      this.tableSelectData = selection;
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
