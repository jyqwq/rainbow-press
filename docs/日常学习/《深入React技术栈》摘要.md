---
title: 《深入React技术栈》摘要
tags:
  - 笔记
  - 学习
  - 待续
createTime: 2021/10/11
permalink: /article/rkyan4lg/
---
# 《深入React技术栈》摘要

## React组件

### 早期组件化的特点

- **基本的封装性。**尽管说 JavaScript 没有真正面向对象的方法，但我们还是可以通过实例化 的方法来制造对象。
- **简单的生命周期呈现。**最明显的两个方法 constructor 和destroy，代表了组件的挂载和 卸载过程。但除此之外，其他过程(如更新时的生命周期)并没有体现。
- **明确的数据流动。**这里的数据指的是调用组件的参数。一旦确定参数的值，就会解析传 进来的参数，根据参数的不同作出不同的响应，从而得到渲染结果。

### React组件的构建

**React 组件即为组件元素。**组件元素被描述成纯粹的 JSON 对象，意味着可以使用方法或是类来构建。React组件基本上由 3 个部分组成——属性(props)、状态(state)以及生命周期方法。这里我们从一张图来简单概括React：

![image-20210601162129366](/Users/jiyuan/Library/Application%20Support/typora-user-images/image-20210601162129366.png)

React 组件可以接收参数，也可能有自身状态。一旦接收到的参数或自身状态有所改变，React 组件就会执行相应的生命周期方法，最后渲染。整个过程完全符合传统组件所定义的组件职责。



**React组件的构建方法**

- **React.createClass**

  用 React.createClass 构建组件是 React 最传统、也是兼容性最好的方法。

  ```javascript
  const Button = React.createClass({ 
    getDefaultProps() {
    	return {
      	color: 'blue', 
      	text: 'Confirm',
      }; 
    },
    render() {
    	const { color, text } = this.props;
    	return (
    		<button className={`btn btn-${color}`}>
    			<em>{text}</em> 
  			</button>
    	); 
  	}
  });
  ```

  从表象上看，React.createClass 方法就是构建一个组件对象。当另一个组件需要调用 Button 组件时，只用写成 <Button />，就可以被解析成 React.createElement(Button) 方法来创建 Button 实例，这意味着在一个应用中调用几次 Button，就会创建几次 Button 实例。

- **ES6 classes**

  ES6 classes 的写法是通过 ES6 标准的类语法的方式来构建方法:

  ```javascript
  import React, { Component } from 'react';
  
  class Button extends Component { 
    constructor(props) {
  		super(props); 
    }
   	static defaultProps = {
      color: 'blue',
      text: 'Confirm',
   	};
  	render() {
  		const { color, text } = this.props;
  		return (
  			<button className={`btn btn-${color}`}>
  				<em>{text}</em> 
  			</button>
  		); 
  	}
  }
  ```

  这里的直观感受是从调用内部方法变成了用类来实现。与 createClass 的结果相同的是，调用类实现的组件会创建实例对象。

  > 说明：
  >
  > React 的所有组件都继承自顶层类 React.Component。它的定义非常简洁，只是初始化了 React.Component 方法，声明了 props、context、refs 等，并在原型上定义了 setState 和 forceUpdate 方法。内部初始化的生命周期方法与 createClass 方式使用的是同一个方法 创建的。

- **无状态函数**

  使用无状态函数构建的组件称为无状态组件，这种构建方式是 0.14 版本之后新增的，且官方颇为推崇。

  ```javascript
  function Button({ color = 'blue', text = 'Confirm' }) { 
    return (
      <button className={`btn btn-${color}`}> 
        <em>{text}</em>
      </button> 
  	);
  }
  ```

  无状态组件只传入props和context两个参数;也就是说，它不存在 state，也没有生命周期方法，组件本身即上面两种 React 组件构建方法中的render方法。不过，像propTypes和 defaultProps 还是可以通过向方法设置静态属性来实现的。

  在适合的情况下，我们都应该且必须使用无状态组件。无状态组件不像上述两种方法在调用 时会创建新实例，它创建时始终保持了一个实例，避免了不必要的检查和内存分配，做到了内部优化。

