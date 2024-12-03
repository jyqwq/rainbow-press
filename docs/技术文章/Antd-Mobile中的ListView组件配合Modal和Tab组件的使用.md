---
title: Antd-Mobile中的ListView组件配合Modal和Tab组件的使用
tags:
  - 工作
  - 方法论
createTime: 2021/10/11
permalink: /article/3eo9hd0t/
---
# Antd-Mobile中的ListView组件配合Modal和Tab组件的使用

ListView组件官方文档：https://mobile.ant.design/components/list-view-cn/

其实官网中的说明已经很详细了，但是在实际操作过程中还是会有一些点需要花点时间去实现。

## ListView的封装使用

先直接挂代码

```javascript
import React, { memo } from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';
import messages from './messages';
import Nodes from './nodes';
import { ListView,ActivityIndicator } from 'antd-mobile'

function ListPullToRefresh(props) {
  const { data, MsgCard, onRefresh, pageSize, noMore, loading, BodyComponent } = props;

  const dataSource = new ListView.DataSource({
    rowHasChanged: (row1, row2) => row1 !== row2,
  });

  let child = null;

  const onEndReached = () => {
    if (noMore) return;
    onRefresh && onRefresh();
  }
  //这里是处理自定义body的
  let body = {};
  let useBodyScroll = true;
  if (BodyComponent) {
    body.renderBodyComponent=() => <BodyComponent />;
    body.style={height:'90vh'};//因为是自定义的body所以ListView需要设置高度，否则不会触发滚动监听
    useBodyScroll = false
  }
  return (
    <>
      <ListView
        className='pull-to-refresh'
        ref={c => child = c}
        dataSource={dataSource.cloneWithRows(data)}
        renderRow={(item, sectionID, index) => <MsgCard rowItem={item} rowIndex={index} {...props} />}
        useBodyScroll={useBodyScroll}
        pageSize={pageSize || 10}
        onEndReached={onEndReached}
        onEndReachedThreshold={300} //调用onEndReached之前的临界值
        {...body}
        renderFooter={()=>(<div style={{ textAlign: 'center' }}>
          {loading ? <Nodes.LoadingStyle><ActivityIndicator animating /></Nodes.LoadingStyle>:(noMore? '已经到底了':'向上滑动加载更多')}
        </div>)}/>
        </>
  );
}

ListPullToRefresh.propTypes = {
  data:PropTypes.array,
  MsgCard:PropTypes.object, // 信息卡片组件
  onRefresh:PropTypes.func.isRequired,
  pageSize:PropTypes.number,
  noMore:PropTypes.bool, // 不再加载更多
  loading:PropTypes.bool,
  BodyComponent:PropTypes.func,
};

export default memo(ListPullToRefresh);
```

## 普通页面的使用

我这里默认情况下是直接用body的滚动条，所以useBodyScroll=true

```javascript
<ListPullToRefresh
  data={messageList} //这里是数据
  MsgCard={MsgCard} //MsgCard是渲染每个卡片的组件
  noMore={noMore} 
  loading={loading}
  onRefresh={()=>{
		console.log('onRefresh')
  }}/>
```

## Tab页面的使用

因为Tab页面会有多个刷新的模块，所以要保证每个模块之间不会互相干扰刷新，这里我用了Tab的activeTab来判断刷新哪一个Tab里面的ListView

```javascript
<TopTab //这里的TopTab是我自己基于Tabs封装的一个tab组件
  showNum={3}
  changeTabAction={changeTab}
  tabBarTitles={funNumMenu} //tab标题的数组
  defaultUnderLine={true}
  barTop='3.9rem'
  tabTop='10.5rem'>
  {
    (funNumMenu && funNumMenu.length)? funNumMenu.map((item,index)=>{
      return <Nodes.ContentStyle key={item.code}>
        <ListPullToRefresh
          data={listResume}
          MsgCard={CandidateCard}
          history={props.history}
          noMore={noMore}
          loading={loading}
          onRefresh={()=>{
            if (loading) return;
            //这里我把当前活动的tab（activeTab）保存到了redux中，每次执行刷新的时候判断是否是当前的模块，防止下拉上滑的时候多个模块一起执行了刷新的逻辑
            activeTab===index && props.pullLoadingAction(true);
            activeTab===index && console.log('tab-'+index,currentPage+1);
            activeTab===index && props.listResumeAction(currentPage+1);
          }}/>
      </Nodes.ContentStyle>
    }):''
  }
</TopTab>
```

## Modal中的使用

因为Modal是弹出框所以是不能使用body的滚动的，所以需要自定义滚动的body

```javascript
//这是包裹的外层结构
function MyBody(props) {
  return (
    <div className='am-list-body'>
      <Nodes.tabCont>
        {props.children}
      </Nodes.tabCont>
    </div>
  );
}

//使用的时候把上面的方法传入
<ListPullToRefresh
  data={totalPost.postList || []}
  MsgCard={PostCard}
  noMore={totalPost.noMoreTotal || false}
  openItem={changeCheckPost}
  checkedIds={checkedIds}
  BodyComponent={MyBody} //这里传入包裹的外层结构 使用的是这一层的滚动 可以回头看一下封装中使用到BodyComponent的地方
  onRefresh={(callback)=>{
    console.log('1');
    pullLoadingData(totalPost.postCurPage+1)
  }}/>
```

看似简单的问题，但实际业务中的处理会比较迷惑，这个问题看了半天才弄清楚自定义body的问题。

