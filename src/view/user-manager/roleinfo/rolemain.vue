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
          <Form ref="searchData" :model="searchData" style="margin:0px" inline>
            <FormItem label="名称" prop="name" :label-width=50>
              <Input type="text" v-model="searchData.name" placeholder="名称" />
            </FormItem>
            <FormItem label="备注信息" prop="descn" :label-width=70>
              <Input v-model="searchData.descn" placeholder="备注信息" />
            </FormItem>
            <FormItem label="状态" prop="status" :label-width=50>
              <Select v-model="searchData.status" clearable style="width:70px">
                <Option v-for="item in statusList" :value="item.value" :key="item.value" :disabled="item.disabled">{{ item.label }}</Option>
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
              <Button icon="md-add" @click="addRoleButton">添加</Button>
              <Button icon="md-close" @click="deleteRoleButton" :disabled="deleteButtonDisabled">删除</Button>
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
            <Table height="520" ref="roleTableRef" :loading="loading" :columns="tableColumn" :data="tableData" border stripe @on-selection-change="selectionChange"></Table>
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
            <Option v-for="item in statusList" :value="item.value" :key="item.value" :disabled="item.disabled">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="备注" prop="descn">
          <Input v-model="modalFormItem.descn" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="备注信息..." />
        </FormItem>
      </Form>
    </Modal>
    <Modal title="关联资源" v-model="resourceModal" :closable="false" :mask-closable="false" :loading="modalLoading2" ok-text="提交" cancel-text="取消" @on-ok="resModalSubmit()" @on-cancel="modalCancel()" width=600>
      <resource-tree ref="restree" :roleId="treedata.roleId" @setCheckedResource="setCheckedResource"></resource-tree>
    </Modal>
  </div>
</template>
<script>
import { axFindRolesWithPaging, axDeleteRole, axAddRole, axUpdateRole, axHasRelateUser, axUpdateRolePermission } from '@/api/roleinfo'
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
          width: 250
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
                      this.editRoleOper(params);
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
                      this.deleteRoleButton(params, true);
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
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.updatePermission(params);
                    }
                  }
                },
                "关联资源"
              )
              // ,
              // h( "Button", { props: {  type: "default",  size: "small" }, style: { marginRight: "0px"  }, on: {click: () => {   this.updatePermission(params);}} }, "关联用户")
            ]);
          }
        }
      ],

      tableData: [],

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
      addModal: false,
      resourceModal: false,

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

      treedata: {
        roleId: 0
      },

      loading: true,
      modalLoading: true,
      modalLoading2: true,
      tableSelectData: [],
      deleteButtonDisabled: true,
      updateResourceData: [],
      roleModalDataChanged: false
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
      this.$Loading.start();
      this.loading = true;
      var data = {
        name: this.searchData.name,
        descn: this.searchData.descn,
        status: this.searchData.status,
        currentPage: this.pageInfo.currentPage,
        pageSize: this.pageInfo.pageSize
      };
      var token = "123";
      //axios-获取角色信息
      axFindRolesWithPaging(data).then(res => {
        if (res.data.code == 200) {
          this.pageInfo.totalPages = res.data.data.total;
          this.tableData = res.data.data.list;
          this.loading = false;
          this.$Loading.finish();
        } else {
          this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
          this.loading = false;
          this.$Loading.error();
        }
      }).catch(error => {
        this.$Notice.error({ title: "错误提示", desc: err + "<br/>无法获取后台数据！" });
        this.loading = false;
        this.$Loading.error();
      });
    },

    searchSubmit() {
      this.refreshTable();
    },
    searchReset(name) {
      this.$refs[name].resetFields();
    },

    //添加记录
    addRoleButton() {
      this.modalFormItem = {};
      this.modalFormItem.gender = 1;
      this.modalFormItem.status = 1;
      this.modalFormItem.modalTitle = "添加角色";
      this.modalFormItem.modalSubmitType = "add";

      this.addModal = true;
    },
    //修改记录
    editRoleOper(rowdata) {
      this.modalFormItem = rowdata.row;
      this.modalFormItem.modalTitle = "修改角色";
      this.modalFormItem.modalSubmitType = "edit";
      this.addModal = true;
      //点击行删除时选中当前行
      this.$refs.roleTableRef.selectAll(false);
      this.$refs.roleTableRef.toggleSelect(rowdata.index);
    },
    //删除记录 
    deleteRoleButton(data, operator) {
      this.$Loading.start();
      if (operator) {
        this.tableSelectData = [];
        this.tableSelectData[0] = data.row;
        //点击行删除时选中当前行
        this.$refs.roleTableRef.selectAll(false);
        this.$refs.roleTableRef.toggleSelect(data.index);
      }


      if (this.tableSelectData.length > 0) {
        let ids = new Array();
        for (var i = 0; i < this.tableSelectData.length; i++) {
          ids[i] = this.tableSelectData[i].id;
        }

        this.$Modal.confirm({
          title: "<font color='red'>删除确认</font>",
          content: "<h3>确定删除选中角色信息？</h3>",
          onOk: () => {

            let params = new URLSearchParams();
            params.append('userIds', ids);

            //axios-删除角色
            axDeleteRole(params).then(res => {
              if (res.data.code == 200) {
                this.$Notice.success({ desc: "删除角色成功！" });
                this.refreshTable();
                this.deleteButtonDisabled = true;
                this.$Loading.finish();
              } else {
                this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
                this.$Loading.error();
              }
            }).catch(error => {
              this.$Notice.error({ title: "错误提示", desc: error + "<br/>无法获取后台数据！" });
              this.loading = false;
              this.$Loading.error();
            });

          },
          onCancel: () => {
            this.$Loading.finish();
          }
        });

      }
    },
    //提交表单
    modalSubmit(name) {

      this.$Loading.start();
      this.$refs[name].validate(valid => {
        if (valid) {
          let params = new URLSearchParams();
          params.append('data', JSON.stringify(this.modalFormItem));
          params.append('token', '123');
          //添加角色
          if (this.modalFormItem.modalSubmitType == "add") {

            axAddRole(params).then(res => {
              if (res.data.code == 200) {
                this.$Notice.success({ desc: "角色添加成功！" });
                this.refreshTable();
                this.$refs[name].resetFields();
                this.$Loading.finish();
                this.addModal = false;
              } else {
                this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
                this.$Loading.error();
              }
            }).catch(error => {
              this.$Notice.error({ title: "错误提示", desc: error + "<br/>无法获取后台数据！" });
              this.loading = false;
              this.$Loading.error();
            });

            //修改用户
          } else if (this.modalFormItem.modalSubmitType == "edit") {

            axUpdateRole(params).then(res => {
              if (res.data.code == 200) {
                this.$Notice.success({ desc: "角色修改成功！" });
                this.refreshTable();
                this.$refs[name].resetFields();
                this.$Loading.finish();
                this.addModal = false;
              } else {
                this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
                this.$Loading.error();
              }
            }).catch(error => {
              this.$Notice.error({ title: "错误提示", desc: error + "<br/>无法获取后台数据！" });
              this.loading = false;
              this.$Loading.error();
            });
          } else {
            this.$Message.error("Fail!  DATA ERROR!!!");
            this.$Loading.error();
          }
        } else {
          setTimeout(() => {
            this.modalLoading = false;
            this.$nextTick(() => {
              this.modalLoading = true;
            });
          }, 1000);
          this.$Message.error({ content: '请检查表单填写信息!' });
        }
      });
    },
    modalCancel(name) {
      //this.$refs[name].resetFields();
    },

    //修改角色资源提交
    resModalSubmit() {
      //资源改变后提交，未改变直接关闭modal
      if (this.roleModalDataChanged) {
        this.$Loading.start();
        console.log(this.updateResourceData);
        console.log(this.treedata.roleId);
        let params = new URLSearchParams();
        params.append("resourceIds", this.updateResourceData);
        params.append("roleId", this.treedata.roleId);
        params.append("token", "123");

        //axios-修改角色资源信息
        axUpdateRolePermission(params).then(res => {
          if (res.data.code == 200) {
            this.$Notice.success({ desc: "操作成功！" });
            this.$Loading.finish();
            this.resourceModal = false;
          } else {
            this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
            this.$Loading.error();
          }
        }).catch(error => {
          this.$Notice.error({ title: "错误提示", desc: error + "<br/>无法获取后台数据！" });
          this.$Loading.error();
        });
      } else {
        this.resourceModal = false;
      }
    },

    /**
     * 获取子组件选中的资源
     */
    setCheckedResource(data) {
      this.roleModalDataChanged = true;
      this.updateResourceData = data;
    },

    //角色关联资源
    updatePermission(data) {
      var roleid = data.row.id;
      this.treedata.roleId = roleid;
      this.resourceModal = true;
      this.roleModalDataChanged = false;
      this.$refs.restree.findNodes(roleid);
    },

    selectionChange(selection) {
      if (selection.length == 0) {
        this.deleteButtonDisabled = true;
      } else if (selection.length >= 1) {
        this.deleteButtonDisabled = false;
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
