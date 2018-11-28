<template>
  <div class="tree-split">
    <Split v-model="split1">
      <div slot="left" class="tree-split-pane">
        <div class="left-div">
          <Tree ref="treedata" :data="treedata" @on-check-change="checkChange" @on-select-change="selectChange" show-checkbox></Tree>
        </div>
      </div>
      <div slot="right" class="tree-split-pane">
        <Divider>资源详情</Divider>
        <Form ref="resourceDetail" v-model="resourceDetail" :label-width="60" style="margin:20px;">
          <FormItem label="节点" prop="orderStr">
            <Input v-model="resourceDetail.orderStr" :readonly="true" />
          </FormItem>
          <FormItem label="名称" prop="title">
            <Input v-model="resourceDetail.title" :readonly="true" />
          </FormItem>
          <FormItem label="路径" prop="url">
            <Input v-model="resourceDetail.url" :readonly="true" />
          </FormItem>
          <FormItem label="层级" prop="level">
            <Input v-model="resourceDetail.level" :readonly="true" />
          </FormItem>
          <FormItem label="备注" prop="descn">
            <Input v-model="resourceDetail.descn" :readonly="true" type="textarea" :autosize="{minRows: 2,maxRows: 5}" />
          </FormItem>
        </Form>
      </div>
    </Split>
  </div>
</template>
<script>
import {axFindPermissionTreeData} from '@/api/permissioninfo'
export default {

  name: 'resource-tree',
  props: {
    roleId: Number
  },
  data() {
    return {
      split1: 0.4,
      resourceDetail: {
        orderStr: "",
        title: "",
        url: "",
        level: "",
        descn: ""
      },
      treedata: [],
      allCheckedNodeId: []
    }
  },
  methods: {
    checkChange(data) {
      this.allCheckedNodeId = [];
      this.getAllCheckedNodeId(this.treedata);
      this.$emit('setCheckedResource',this.allCheckedNodeId);
    },
    selectChange(data) {
      this.resourceDetail = data[0];
    },

    //初始化tree
    initTree() {
      console.log("init...");
    },

    //获取后台节点
    findNodes(roleid) {
      console.log(roleid);
      let data = { "roleid": roleid, "status": "1" };

      axFindPermissionTreeData(data).then(res => {
        if (res.data.code == 200) {
          this.treedata = res.data.data;
        } else {
          this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
        }
      }).catch(error => {
        this.$Notice.error({ title: "错误提示", desc: error + "<br/>无法获取后台数据！" });
      });
    },
    //获取所有勾选节点的id，包括父节点  
    getAllCheckedNodeId(parent) {
      parent.forEach(item => {
        if (item.indeterminate || item.checked) {
          this.allCheckedNodeId.push(item.id);
          if (item.children) {
            this.allCheckedNodeId.concat(this.getAllCheckedNodeId(item.children));
          }
        }
      });
    }

  },
  mounted() {

    this.initTree();
  }
}

</script>
<style>
.tree-split {
  height: 400px;
  border: 1px solid #dcdee2;
}

.tree-split-pane {
  padding: 10px;
}

.left-div {
  height: 380px;
  overflow: auto;
}

</style>
