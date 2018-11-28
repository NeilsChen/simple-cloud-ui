<template>
  <div>
    <Row>
      <Col span="24">
      <Card :dis-hover="true" style="height:827px">
        <p slot="title">
          <Icon type="md-people"></Icon>
          资源列表
        </p>
        <Row type="flex" justify="start">
          <ButtonGroup size="large">
            <Button icon="md-add" @click="addDataButton">添加</Button>
            <Button icon="md-create" @click="editDataButton" :disabled="EDButtonDisable">修改</Button>
            <Button icon="md-close" @click="deleteDataButton" :disabled="EDButtonDisable">删除</Button>
          </ButtonGroup>
          <span style="margin-left:10px;" />
          <ButtonGroup size="large">
            <Button icon="md-refresh" @click="refreshTable">刷新</Button>
          </ButtonGroup>
        </Row>
        <Row type="flex" justify="start" style="margin-top:10px;">
          <Col span="8">
          <Card :dis-hover="true" style="height:660px;overflow:auto;">
            <!-- show-checkbox -->
            <Tree :data="treedata" ref="treedata" @on-select-change="selectChange"></Tree>
          </Card>
          </Col>
          <Col span="15" style="margin-left:5px;">
          <Card :dis-hover="true" style="height:660px">
            <Form ref="resourceDetail" v-model="resourceDetail" :label-width="60" style="margin:20px;">
              <FormItem label="父ID" prop="pid">
                <Input v-model="resourceDetail.pid" disabled />
              </FormItem>
              <FormItem label="ID" prop="id">
                <Input v-model="resourceDetail.id" disabled />
              </FormItem>
              <FormItem label="层级" prop="level">
                <Input v-model="resourceDetail.level" disabled />
              </FormItem>
              <FormItem label="名称" prop="title">
                <Input v-model="resourceDetail.name" :disabled="formEditDisable" />
              </FormItem>
              <FormItem label="路径" prop="url">
                <Input v-model="resourceDetail.url" :disabled="formEditDisable" />
              </FormItem>
              <FormItem label="状态" prop="status">
                <Select v-model="resourceDetail.status" clearable style="width:150px" :disabled="formEditDisable">
                  <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
              <FormItem label="备注" prop="descn">
                <Input v-model="resourceDetail.descn" :disabled="formEditDisable" type="textarea" :autosize="{minRows: 2,maxRows: 5}" />
              </FormItem>
              <FormItem>
                <Button @click="saveData" type="primary" v-show="buttonShow">保 存</Button>
                <Button @click="cancelSave" style="margin-left: 8px" v-show="buttonShow">取 消</Button>
              </FormItem>
            </Form>
          </Card>
          </Col>
        </Row>
      </Card>
      </Col>
    </Row>
  </div>
</template>
<script>
import { axAddOrUpdatePermission, axFindPermissionTreeData, axDeletePermission } from '@/api/permissioninfo'
export default {
  name: "userinfo-table",

  data() {
    return {
      resourceDetail: {
        pid: "",
        id: "",
        name: "",
        url: "",
        level: "",
        status: 1,
        descn: ""
      },
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
        },
        {
          value: 3,
          label: '删除'
        }
      ],
      treedata: [],
      buttonShow: false,
      formEditDisable: true,
      EDButtonDisable: true
    }
  },
  methods: {
    selectChange(data) {

      if (data.length > 0) {
        this.EDButtonDisable = false;
        this.resourceDetail = data[0];
      } else {
        this.resourceDetail = { status: 1 };
        this.EDButtonDisable = true;
      }
      this.buttonShow = false;
      this.formEditDisable = true;

    },
    addDataButton() {
      let initData = { status: 1 };
      let selectData = this.$refs.treedata.getSelectedNodes();
      if (selectData.length > 0) {
        initData.pid = selectData[0].id;
        initData.level = parseInt(selectData[0].level) + 1;
      } else {
        initData.pid = 0;
        initData.level = 1;
      }
      console.log(initData);
      this.resourceDetail = initData;
      this.buttonShow = true;
      this.formEditDisable = false;
    },
    editDataButton() {

      this.buttonShow = true;
      this.formEditDisable = false;
    },
    deleteDataButton() {
      console.log(this.resourceDetail);
      this.$Loading.start();
      if (this.resourceDetail.children) {
        this.$Modal.confirm({
          title: "<font color='orange'>删除确认</font>",
          content: "<h3>确定删除【" + this.resourceDetail.title + "】节点及其所有子节点资源？</h3>",
          onOk: () => {
            this.deletePermission();
          },
          onCancel: () => {
            this.$Loading.finish();
          }
        });
      } else {
        this.deletePermission();
      }
      this.buttonShow = false;
      this.formEditDisable = true;
    },

    deletePermission() {
      let params = new URLSearchParams();
      params.append('id', this.resourceDetail.id);
      //axios-删除资源
      axDeletePermission(params).then(res => {
        if (res.data.code == 200) {
          this.$Notice.success({ desc: "删除资源成功！" });
          this.refreshTable();
          this.$Loading.finish();
        } else {
          this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
          this.$Loading.error();
        }
      }).catch(error => {
        this.$Notice.error({ title: "错误提示", desc: error + "<br/>无法获取后台数据！" });
        this.$Loading.error();
      });
    },

    saveData() {

      let params = new URLSearchParams();
      params.append('data', JSON.stringify(this.resourceDetail));

      //axios-增加或修改资源
      axAddOrUpdatePermission(params).then(res => {
        if (res.data.code == 200) {
          this.$Notice.success({ desc: "操作成功！" });
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
    cancelSave() {
      this.buttonShow = false;
      this.formEditDisable = true;
      this.resourceDetail = {};
    },
    refreshTable() {
      this.EDButtonDisable = true;
      // this.resourceDetail = {};、
      this.initTreeData();
    },


    initTreeData() {
      //获取后台节点
      let data = {};
      axFindPermissionTreeData(data).then(res => {
        if (res.data.code == 200) {
          this.treedata = res.data.data;
        } else {
          this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
        }
      }).catch(error => {
        this.$Notice.error({ title: "错误提示", desc: error + "<br/>无法获取后台数据！" });
      });

      this.buttonShow = false;
      this.formEditDisable = true;
    }
  },
  mounted() {
    this.$Loading.start();
    this.initTreeData();
    this.$Loading.finish();
  }
}

</script>
