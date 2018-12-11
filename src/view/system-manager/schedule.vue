<template>
  <div>
    <Row>
      <Col span="24">
      <Card :dis-hover="true">
        <p slot="title">
          <Icon type="md-briefcase" />
          任务列表
        </p>
        <Card style="padding-top:20px;" :padding="0">
          <Form ref="tableSearchData" :model="tableSearchData" style="margin:0px" inline>
            <Row>
              <FormItem label="任务代码" prop="jobName" :label-width=80>
                <Input type="text" v-model="tableSearchData.jobName"  />
              </FormItem>
              <FormItem label="执行类" prop="jobClassName" :label-width=80>
                <Input type="text" v-model="tableSearchData.jobClassName" />
              </FormItem>
              <FormItem label="任务描述" prop="description" :label-width=80>
                <Input type="text" v-model="tableSearchData.description" />
              </FormItem>
              <FormItem label="任务状态" prop="triggerState" :label-width=80>
                <Select v-model="tableSearchData.triggerState" clearable style="width:120px">
                  <Option v-for="item in triggerStateList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
              <FormItem>
                <span style="padding-left:50px;" />
                <Button type="primary" @click="handleSearchData" icon="md-search">搜索</Button>
              </FormItem>
              <FormItem>
                <Button @click="handleCancelData('tableSearchData')" icon="md-refresh">重置</Button>
              </FormItem>
            </Row>
          </Form>
        </Card>
        <Card style="margin-top:10px;">
          <Row type="flex" justify="start">
            <ButtonGroup size="large">
              <Button icon="md-add" @click="addData">添加</Button>
              <Button icon="md-play" @click="startJob" :disabled="topButtonDisabled">启动</Button>
              <Button icon="md-pause" @click="pauseJob" :disabled="topButtonDisabled">暂停</Button>
              <Button icon="md-close" @click="deleteData" :disabled="topButtonDisabled">删除</Button>
            </ButtonGroup>
            <span style="margin-left:10px;" />
            <ButtonGroup size="large">
              <Button icon="md-refresh" @click="refreshTable">刷新</Button>
            </ButtonGroup>
          </Row>
        </Card>
        <Card style="margin-top:10px;" :padding="0" :bordered="false">
          <Row>
            <Table height="520" ref="tableRef" :loading="tableLoading" :columns="tableColumn" :data="tableData" border stripe @on-selection-change="selectionChange"></Table>
          </Row>
          <Row type="flex" justify="center">
            <Page style="margin:10px;" :total="pageInfo.totalPages" :current="pageInfo.currentPage" :page-size="pageInfo.pageSize" :page-size-opts="pageInfo.pageSizeOpt" @on-change="changePage" @on-page-size-change="changeSize" show-elevator show-sizer show-total placement="top"></Page>
          </Row>
        </Card>
      </Card>
      </Col>
    </Row>

    <Modal :title="modalFormItem.modalTitle" v-model="addOrEditModal" :closable="false" :mask-closable="false" :loading="addOrEditModalLoading" ok-text="提交" cancel-text="取消" @on-ok="modalFormSubmit('modalFormItem')" @on-cancel="modalFormCancel('modalFormItem')">
      <Form ref="modalFormItem" :model="modalFormItem" :rules="modalFormRuleValidate" :label-width=100>
        <FormItem label="任务代码" prop="jobName">
          <Input v-model="modalFormItem.jobName" :disabled="modalFormItem.formEditDisable" />
        </FormItem>
        <FormItem label="执行类" prop="jobClassName">
          <Input v-model="modalFormItem.jobClassName" :disabled="modalFormItem.formEditDisable" />
        </FormItem>
        <FormItem label="cron表达式" prop="cronExpression">
          <Input v-model="modalFormItem.cronExpression" />
        </FormItem>
        <FormItem label="任务状态" prop="triggerState">
          <Select v-model="modalFormItem.triggerState" :disabled="modalFormItem.formEditDisable">
            <Option v-for="item in triggerStateList" :value="item.value" :key="item.value" :disabled="item.disabled">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="任务描述" prop="description">
          <Input v-model="modalFormItem.description" type="textarea" :autosize="{minRows: 2,maxRows: 5}"  />
        </FormItem>
      </Form>
    </Modal>

    <Modal :title="jobLogModalTitle" v-model="jobLogDetailModal"  width="1000" :mask-closable="false"  ok-text="确定" cancel-text="取消" >
      <Row>
        <Table height="520" ref="jobLogTableRef" :columns="jobLogTableColumn" :data="jobLogTableData" border stripe ></Table>
      </Row>
      <Row type="flex" justify="center">
        <Page style="margin:10px;" :total="logPageInfo.totalPages" :current="logPageInfo.currentPage" :page-size="logPageInfo.pageSize" :page-size-opts="logPageInfo.pageSizeOpt" @on-change="changeLogPage" @on-page-size-change="changeLogSize" show-elevator show-sizer show-total placement="top"></Page>
      </Row>
    </Modal>
  </div>
</template>
<script>

import { axFindJobsWithPaging, axAddJob, axTriggerJob, axPauseJob, axStartJob, axRemoveJob, axUpdateJob, axFindJobLogDetais} from '@/api/jobinfo'

export default {
  name: "jobinfo-table",

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
            return h("span",params.index +(this.pageInfo.currentPage - 1) * this.pageInfo.pageSize +1 );
          }
        },
        {
          key: "jobName",
          title: "任务代码",
          align: "center",
          width: 180,
          sortable:true
        },
        {
          key: "description",
          title: "任务描述",
          align: "center",
          width: 250,
          tooltip:true
        },
        {
          key: "cronExpression",
          title: "cron表达式",
          align: "center",
          width: 160
        },
         {
          key: "jobClassName",
          title: "执行类",
          align: "center",
          width: 250,
          tooltip:true,
          sortable:true
        },
        {
          key: "triggerState",
          title: "任务状态",
          align: "center",
          width: 120,
          sortable:true,
          render: (h, params) => {
            let texts = "空值";
            let color = "";
            if (params.row.triggerState == 'NONE') {
              texts = "无";
              color = "gray";
            } else if (params.row.triggerState == 'NORMAL') {
              texts = "正常";
              color = "blue";
            } else if (params.row.triggerState == 'PAUSED') {
              texts = "暂停";
              color = "orange";
            } else if (params.row.triggerState == 'COMPLETE') {
              texts = "结束";
              color = "green";
            }else if (params.row.triggerState == 'ERROR') {
              texts = "错误";
              color = "red";
            }else if (params.row.triggerState == 'BLOCKED') {
              texts = "阻塞";
              color = "yellow";
            }else if (params.row.triggerState == 'ACQUIRED') {
              texts = "运行中";
              color = "success";
            }else if (params.row.triggerState == 'WAITING') {
              texts = "等待中";
              color = "primary";
            }
            // return h('div',{props: {}},texts);
            return h(
              "Tag", {
                props: {
                  // type: "dot",
                  color: color
                }
              },
              texts
            );
          }
        },
        {
          key: "prevFireTime",
          title: "上一次运行时间",
          align: "center",
          width: 160,
          render: function(h, params) {
            return h(
              "div",
              params.row.prevFireTime == null ?
              "" :
              new Date(params.row.prevFireTime).format("yyyy-MM-dd hh:mm:ss")
            );
          }
        },
        {
          key: "nextFireTime",
          title: "下一次运行时间",
          align: "center",
          width: 160,
          render: function(h, params) {
            return h(
              "div",
              params.row.nextFireTime == null ?
              "" :
              new Date(params.row.nextFireTime).format("yyyy-MM-dd hh:mm:ss")
            );
          }
        }, 
        {
          key: "prevFireResult",
          title: "上一次运行结果",
          align: "center",
          width: 220,
          tooltip:true
        },
        {
          title: "操作",
          key: "action",
          width: 240,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            return h("div", [
              h("Tooltip",{props:{content:"查看运行日志！"}},
                [h("Button", {props: {type: "default",size: "small"},style: {marginRight: "5px"},on: {click: () => {this.showLogDetail(params);}}},"日志")]
              ),
               h("Tooltip",{props:{content:"运行任务一次！"}},
                [h("Button", {props: {type: "default",size: "small"},style: {marginRight: "5px"},on: {click: () => {this.runOnce(params);}}},"运行")]
                ),
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
                      this.editData(params);
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
                      this.deleteData(params, true);
                    }
                  }
                },
                "删除"
              )
            ]);
          }
        }
      ],
      jobLogTableColumn:[
        {
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
            return h("span",params.index +(this.logPageInfo.currentPage - 1) * this.logPageInfo.pageSize +1 );
          }
        },
        {
          key: "jobName",
          title: "任务代码",
          align: "center",
          width: 180
        },
        {
          key: "type",
          title: "日志类型",
          align: "center",
          width: 180,
          sortable:true,
          render: (h, params) => {
            let texts = "空值";
            let color = "";
            if (params.row.type == 0) {
              texts = "错误";
              color = "error";
            } else if (params.row.type == 1) {
              texts = "正常";
              color = "success";
            } else if (params.row.type == 2) {
              texts = "中止";
              color = "warning";
            }
            // return h('div',{props: {}},texts);
            return h(
              "Tag", {
                props: {
                  // type: "dot",
                  color: color
                }
              },
              texts
            );
          }
        },
        {
          key: "runTime",
          title: "运行时间",
          align: "center",
          width: 160,
          sortable:true,
          render: function(h, params) {
            return h(
              "div",
              params.row.runTime == null ?
              "" :
              new Date(params.row.runTime).format("yyyy-MM-dd hh:mm:ss")
            );
          }
        },
         {
          key: "runResult",
          title: "运行结果",
          align: "center",
          width: 250,
          tooltip:true
        }
      ],
      tableData: [],
      jobLogTableData:[],
      triggerStateList: [
        {value: 'NONE',label: '无'},
        {value: 'NORMAL',label: '正常'},
        {value: 'PAUSED',label: '暂停'},
        {value: 'COMPLETE',label: '完成'},
        {value: 'ERROR',label: '错误'},
        {value: 'BLOCKED',label: '阻塞'}
      ],
      tableSearchData: {
        jobName: "",
        jobClassName: "",
        triggerState: "",
        description:""
      },

      pageInfo: {
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        pageSizeOpt: [10, 20, 30, 50]
      },
      logPageInfo:{
        totalPages: 0,
        currentPage: 1,
        pageSize: 10,
        pageSizeOpt: [10, 20, 30, 50]
      },
      modalFormItem: {
        modalTitle: "",
        modalSubmitType: "",
        formEditDisable: false
      },
     
      tableSelectData: [], //表格选中行数据

      modalFormRuleValidate: {
        jobName: [
          { required: true, message: "任务代码不能为空", trigger: "blur" }
        ],
        jobClassName: [
          { required: true, message: "执行类不能为空", trigger: "blur" }
        ],
        cronExpression: [
          { required: true, message: "cron表达式不能为空", trigger: "blur" }
        ]
      },

      tableLoading: true, // 表格加载中
      addOrEditModal: false,// 增加或修改弹窗
      addOrEditModalLoading: true, // 弹窗按钮加载
      topButtonDisabled: true, // 上部按钮是否可用
      jobLogDetailModal:false, // 任务日志详情弹窗
      jobLogModalTitle:"日志详情"
    };
  },
  methods: {
    init() {},

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
      this.tableLoading = true;
      var data = {
        jobName: this.tableSearchData.jobName,
        description: this.tableSearchData.description,
        jobClassName: this.tableSearchData.jobClassName,
        triggerState: this.tableSearchData.triggerState,
        currentPage: this.pageInfo.currentPage,
        pageSize: this.pageInfo.pageSize
      };

      // axios-查询任务数据
      axFindJobsWithPaging(data).then(res => {
        if (res.data.code == 200) {
          this.pageInfo.totalPages = res.data.data.total;
          this.tableData = res.data.data.list;
          this.tableLoading = false;
          this.$Loading.finish();
        } else {
          this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
          this.$Loading.error();
        }
      }).catch(err => {
        this.$Notice.error({ title: "错误提示", desc: err + "<br/>无法获取后台数据！" });
        this.tableLoading = false;
        this.$Loading.error();
      });
    },

    handleSearchData() {
      this.refreshTable();
    },
    handleCancelJob(name) {
      this.$refs[name].resetFields();
    },

    addData() {
      this.modalFormItem = {};
      this.modalFormItem.triggerState = 'NORMAL';
      this.modalFormItem.modalTitle = "添加任务";
      this.modalFormItem.modalSubmitType = "add";
      this.modalFormItem.formEditDisable = false;
      this.addOrEditModal = true;
    },
    editData(rowdata) {
      this.modalFormItem = rowdata.row;
      this.modalFormItem.formEditDisable = true;
      this.modalFormItem.modalTitle = "修改任务";
      this.modalFormItem.modalSubmitType = "edit";
      this.addOrEditModal = true;
      //点击编辑时选中当前行
      this.$refs.tableRef.selectAll(false);
      this.$refs.tableRef.toggleSelect(rowdata.index);
    },
    deleteData(data, single) {
      if (single) {
        this.tableSelectData = [];
        this.tableSelectData[0] = data.row;
        //点击行删除时选中当前行
        this.$refs.tableRef.selectAll(false);
        this.$refs.tableRef.toggleSelect(data.index);
      }
      if (this.tableSelectData.length > 0) {

        this.$Modal.confirm({
          title: "<font color='red'>删除确认</font>",
          content: "<h3>确定删除选中任务信息？</h3>",
          onOk: () => {
            let jobNames = new Array();
            for (var i = 0; i < this.tableSelectData.length; i++) {
             jobNames.push(this.tableSelectData[i].jobName);
            }
            let params = new URLSearchParams();
            params.append('data', jobNames.join(","));

            //axios-删除任务
            axRemoveJob(params).then(res => {
              if (res.data.code == 200) {
                this.$Notice.success({ desc: "删除任务成功！" });
                this.refreshTable();
                this.topButtonDisabled = true;
              } else {
                this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
              }
            }).catch(err => {
              this.$Notice.error({ title: "错误提示", desc: err + "<br/>无法获取后台数据！" });
              this.tableLoading = false;
            });
          }
        });
      }
    },
    // 运行一次任务，然后暂停
    runOnce(rowdata){

      //点击编辑时选中当前行
      this.$refs.tableRef.selectAll(false);
      this.$refs.tableRef.toggleSelect(rowdata.index);

      console.log(rowdata);
      let jobName = rowdata.row.jobName;
      
      let params = new URLSearchParams();
      params.append("jobName",jobName);

       //axios-启动任务
      axTriggerJob(params).then(res => {
        if (res.data.code == 200) {
          this.$Notice.success({ desc: "运行成功！" });
          this.refreshTable();
          this.topButtonDisabled = true;
        } else {
          this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
        }
      }).catch(err => {
        this.$Notice.error({ title: "错误提示", desc: err + "<br/>无法获取后台数据！" });
        this.tableLoading = false;
      });

    },

    // 查看日志
    showLogDetail(rowdata){
      console.log(rowdata);
       //点击编辑时选中当前行
      this.$refs.tableRef.selectAll(false);
      this.$refs.tableRef.toggleSelect(rowdata.index);

      this.jobLogModalTitle = rowdata.row.jobName+"   日志详情";
      this.jobLogDetailModal = true;
      
      this.refreshJobLogTable();
    },
    refreshJobLogTable(){
      console.log(this.tableSelectData);
      let jobName = this.tableSelectData[0].jobName;
      let currentPage = this.logPageInfo.currentPage;
      let pageSize = this.logPageInfo.pageSize;
      axFindJobLogDetais({jobName,currentPage,pageSize}).then(res=>{
        if (res.data.code == 200) {
            this.logPageInfo.totalPages = res.data.data.total;
            this.jobLogTableData = res.data.data.list;
          } else {
            this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
          }
        }).catch(err => {
          this.$Notice.error({ title: "错误提示", desc: err + "<br/>无法获取后台数据！" });
        });
    },
    changeLogPage(page) {
      this.logPageInfo.currentPage = page;
      this.refreshJobLogTable();
    },
    changeLogSize(size) {
      this.logPageInfo.pageSize = size;
      this.refreshJobLogTable();
    },

    // 启动任务
    startJob(){
      this.$Modal.confirm({
          title: "<font color='red'>操作确认</font>",
          content: "<h3>确定启动选中任务？</h3>",
          onOk: () => {
            let jobNames = new Array();
            for (var i = 0; i < this.tableSelectData.length; i++) {
             jobNames.push(this.tableSelectData[i].jobName);
            }
            let params = new URLSearchParams();
            params.append('data', jobNames.join(","));

            //axios-启动任务
            axStartJob(params).then(res => {
              if (res.data.code == 200) {
                this.$Notice.success({ desc: "启动任务成功！" });
                this.refreshTable();
                this.topButtonDisabled = true;
              } else {
                this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
              }
            }).catch(err => {
              this.$Notice.error({ title: "错误提示", desc: err + "<br/>无法获取后台数据！" });
              this.tableLoading = false;
            });
          }
        });

    },
    // 暂停任务
    pauseJob(){
      this.$Modal.confirm({
          title: "<font color='red'>操作确认</font>",
          content: "<h3>确定暂停选中任务？</h3>",
          onOk: () => {
            let jobNames = new Array();
            for (var i = 0; i < this.tableSelectData.length; i++) {
             jobNames.push(this.tableSelectData[i].jobName);
            }
            let params = new URLSearchParams();
            params.append('data', jobNames.join(","));

            //axios-暂停任务
            axPauseJob(params).then(res => {
              if (res.data.code == 200) {
                this.$Notice.success({ desc: "暂停任务成功！" });
                this.refreshTable();
                this.topButtonDisabled = true;
              } else {
                this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
              }
            }).catch(err => {
              this.$Notice.error({ title: "错误提示", desc: err + "<br/>无法获取后台数据！" });
              this.tableLoading = false;
            });
          }
        });

    },
    // 添加任务
    modalFormSubmit(name) {
      this.$refs[name].validate(valid => {
        if (valid) {

          let params = new URLSearchParams();
          params.append('data', JSON.stringify(this.modalFormItem));

          if (this.modalFormItem.modalSubmitType == "add") {
            axAddJob(params).then(res => {
              if (res.data.code == 200) {
                this.$Notice.success({ desc: "任务添加成功！" });
                this.refreshTable();
                this.$refs[name].resetFields();
                this.tableLoading = false;
                this.addOrEditModal = false;
                this.topButtonDisabled = true;
              } else {
                this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
                this.tableLoading = false;
                this.addOrEditModal = false;
              }
            }).catch(error => {
              this.$Notice.error({ title: "错误提示", desc: error + "<br/>无法获取后台数据！" });
              this.tableLoading = false;
              this.addOrEditModal = false;
            });
            //修改任务
          } else if (this.modalFormItem.modalSubmitType == "edit") {
            let upparams = new URLSearchParams();
            upparams.append('jobName', this.modalFormItem.jobName);
            upparams.append('desc', this.modalFormItem.description);
            upparams.append('cron', this.modalFormItem.cronExpression);
            
            axUpdateJob(upparams).then(res => {
                if (res.data.code == 200) {
                  this.$Notice.success({ desc: "任务修改成功！" });
                  this.refreshTable();
                  this.$refs[name].resetFields();
                  this.tableLoading = false;
                  this.addOrEditModal = false;
                  this.topButtonDisabled = true;
                }
                if (res.data.code == 500) {
                  this.$Notice.error({ title: "错误代码：" + res.data.code, desc: res.data.message });
                  this.tableLoading = false;
                  this.addOrEditModal = false;
                }
              })
              .catch(error => {
                this.$Notice.error({ title: "错误提示", desc: error + "<br/>无法获取后台数据！" });
                this.tableLoading = false;
                this.addOrEditModal = false;
              });
          } else {
            this.$Message.error("Fail!  DATA ERROR!!!");
          }
        } else {
          setTimeout(() => {
            this.addOrEditModalLoading = false;
            this.tableLoading = false;
            this.$nextTick(() => {
              this.addOrEditModalLoading = true;
            });
          }, 1000);
          this.$Message.error({ content: '请检查表单填写信息!' });
        }
      });
      //清除验证
      this.$refs[name].resetFields();
    },
    modalFormCancel(name) {
      this.$refs[name].resetFields();
      if (this.modalFormItem.modalSubmitType == "edit") {
        this.refreshTable();
        this.topButtonDisabled = true;
      }
      this.addOrEditModal = false;
    },
    selectionChange(selection) {
      if (selection.length == 0) {
        this.topButtonDisabled = true;
      } else if (selection.length >= 1) {
        this.topButtonDisabled = false;
      }
      this.tableSelectData = selection;
    }
  },
  mounted() {
    this.init();
    this.refreshTable();
  }
}
</script>
