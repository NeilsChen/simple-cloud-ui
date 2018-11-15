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
      this.resourceDetail = {};
      this.buttonShow = false;
      this.formEditDisable = true;
    },
    saveData() {
      let postData = this.$qs.stringify({
        data: JSON.stringify(this.resourceDetail),
        token: "123"
      });
      this.$axios
        .post("/admin-server/permission/addOrUpdatePermission", postData)
        .then(res => {
          if (res.data.code == 200) {
            this.$Notice.success({
              // title: '提示消息',
              duration: 3,
              desc: "操作成功！"
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
            duration: 5,
            desc: error + "<br/>无法获取后台数据！"
          });

          this.loading = false;
        });

    },
    cancelSave() {
      this.buttonShow = false;
      this.formEditDisable = true;
      this.resourceDetail = {};
    },
    refreshTable() {
      this.EDButtonDisable = true;
      this.resourceDetail = {};
      this.initTreeData();
    },


    initTreeData() {
      //获取后台节点
      let data = {};
      let token = "123";
      this.$axios.get("/admin-server/permission/findPermissionTreeData", {
          params: { token: token }
        })
        .then(res => {
          if (res.data.code == 200) {
            this.treedata = res.data.data;
          } else {
            this.$Notice.error({
              title: "错误提示",
              duration: 5,
              desc: res + "<br/>无法获取后台数据！"
            });
          }
        })
        .catch(error => {
          this.$Notice.error({
            title: "错误提示",
            duration: 5,
            desc: error + "<br/>无法获取后台数据！"
          });
        });
    }

  },
  mounted() {
    this.$Loading.start();
    this.initTreeData();
    this.$Loading.finish();
  }
}

</script>
