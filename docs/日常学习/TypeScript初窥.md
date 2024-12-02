---
title: TypeScript初窥
tags:
  - 笔记
  - 面试
  - typescript
createTime: 2021/10/11
permalink: /article/pl6pqlwj/
---
## TypeScript初窥

*[ts中文文档，翻译味有点重](https://jkchao.github.io/typescript-book-chinese/)*

> *写在前面*

​		

> 常用基本命令

```
cnpm i -g typescript //全局安装ts
tsc hello.ts         // 编译hello.ts文件
tsc --init 			 //生成tsconfig.json文件，可在本文件配置一些编译选项。之后可直接运行					 	 
					//tsc，不必指定文件名，编译器会按tsconfig.json内的配置进行编译
tsc -w				 //在检测到文件改动之后，它将重新编译。

cnpm i -g ts-node 	 //安装ts-node模块（是否全局安装看自己需求）
ts-node hello.ts 	 //可直接执行ts代码
```

- #### 声明空间


ts的声明空间分为**类型声明空间**和**变量声明空间**。

**变量声明空间**就是我们正常在js里写的变量声明，而**类型声明空间**包含用来当做**类型注解**的内容。

```ts
class Foo {}		//类
interface Bar {}	//接口
type Bas = {};		//类型别名
```

以上这三种都是类型声明，其中class 既是类型也是变量，但 interface和type只是类型，不能当变量使用。

```ts
let foo: Foo;		//类型注解的基本使用方式
let bar: Bar;		
let bas: Bas;
```

如同类型声明不能当变量使用，变量声明也不能当注解用。

```js
const foo = 123;
let bar: foo; 		// ERROR: "cannot find name 'foo'"
```

- #### 类型系统


1. 基础类型

   - boolean

   - string

   - number

     ```ts
     let num: number;
     let str: string;
     let bool: boolean;
     
     num = 123;
     num = 123.456;
     num = '123'; // Error
     
     str = '123';
     str = 123; // Error
     
     bool = true;
     bool = false;
     bool = 'false'; // Error
     ```

   - **array**  *与js中有所区别，强类型下的Array中元素类型声明后，数组中所有类型均一致*

   ```ts
   let boolArray: boolean[];	//类型数组，元素只能为布尔值
   
   boolArray = [true, false];
   console.log(boolArray[0]); // true
   console.log(boolArray.length); // 2
   
   boolArray[1] = true;
   boolArray = [false, false];
   
   boolArray[0] = 'false'; // Error
   boolArray = 'false'; // Error
   boolArray = [true, 'false']; // Error
   ```

   - **enum**  *枚举类型的作用在于为某些特定的数字提供语义*

   ```ts
   enum CardSuit {
     Clubs,
     Diamonds,
   }
   // 简单的使用枚举类型
   let Card = CardSuit.Clubs;
   // 类型安全
   Card = 'not a member of card suit'; // Error: string 不能赋值给 `CardSuit` //类型
   enum Color {
       Red, 
       Green, 
       Blue
   }    // 默认从第一个变量开始的值为0,1,2。如果第一个值为数字，后面未显式，自动+1
   let c: Color = Color.Green;  // 值为1
   //枚举实际上约等于{ key : 0 , key1 : 1, '0' : key, '1' : key1}，默认是数字枚举
   //枚举编译后的代码类似下面
   //var Tristate;
   //(function(Tristate) {
   //  Tristate[(Tristate['False'] = 0)] = 'False';
   //  Tristate[(Tristate['True'] = 1)] = 'True';
   //  Tristate[(Tristate['Unknown'] = 2)] = 'Unknown';
   //})(Tristate || (Tristate = {}));
   enum Color {
       Red = 'red',
       Green = 'green',
       Blue = 'blue'}    // 显式赋值，非数值显式赋值必须每个都赋
   let c: Color = Color.Green;  // 值为red
   
   ```

   - **tuple**  元组可以看作是数组的拓展，它表示已知元素数量和类型的数组。确切地说，是已知数组中每一个位置上的元素的类型。

     ```ts
     let nameNumber: [string, number];
     
     // Ok
     nameNumber = ['Jenny', 221345];
     
     // Error
     nameNumber = ['Jenny', '221345'];
     
     //元组可以赋值给数组，但是数组不能赋值给元组。编译成js时两者没有区别
     ```

   ![image-20210601154500376](https://file.40017.cn/baoxian/health/health_public/images/blog/image-fail.png)

   - any 任何类型
   - void  *函数返回类型注解，表示无返回*     引申：void 0
   - null
   - undefined
   - **never**  *一个函数永不返回时（或者总是抛出错误），它的返回值为 never 类型*
   - Symbol  *在ts中想使用'Symbol' 需要在'tsconfig.json'的lib中配置 ["es6"]*
   - object  **object**表示非原始类型, 也就是除**number**/ **string**/ **boolean**/ **symbol**/ **null**/ **undefined**之外的类型。**实际上基本不用object**类型的, 因为他标注的非常不具体, 一般都用**接口**来标注更具体的对象类型

2. #### 结构化类型

   - ##### class（es6）

   ```ts
   //复习一下es6的class
   //属性和方法
   class Animal{
       name;//定义属性:这是es6的新写法，之前只能在constructor中通过this.name来定义
       constructor(name){
           this.name = name;
       }
       static onLoad(){
           alert('000');
       }//静态方法
       showName(){
           console.log(this.name);
       }
   }
   let animal = new Animal('狗');
   animal.showName();
   
   //类的继承:使用extends实现继承，通过super()或super.XX调用父类的构造方法或属性和普通方法
   class Dog extends Animal{//若继承了父类，则构造方法中必须要调用父类的构造方法super(...)
       constructor(name){
           super(name);//调用父类的构造方法，将父类的name属性赋值
       }
       //覆盖父类showName()方法
       showName(){
           super.showName();//调用父类的方法，输出父类name属性的值
       }
   }
   let dog = new Dog('汤姆狗');
   dog.showName();
   
   //存取属性setter,getter:会拦截住name属性的取值和存值
   class Animal2{
       // name; 注1：如果写了存取值器（访问器），且命名一样，这里必须定义
       constructor(name){
       	//this.name = name;
           //this._name=name
       }
       set name(name) {//这个方法只是会在name属性被设置值的时候出发，不是setName()，
           //不能在这里this.name = name; 这样做会不停调用到这个监听函数，导致栈溢出
           //this.name = name;//RangeError: Maximum call stack size 		         //exceeded，可用注1解决，实测，但没想明白为什么
           console.log('setter: ' + _name);
           //this.name = name;
           this._name=name
       }
       get name(){
           console.log('getter...');
           //return this.name;
           return this._name;
       }
   //静态方法:static
   class Animal3{
       // constructor(name){
       //     static this.name = name;//不能这么定义静态变量
       // }
       static isAnimal(animal){
           console.log(animal instanceof Animal3);
       }
   }
   //等于Animal3.isAnimal=function(animal){console.log(animal instanceof //Animal3);}
   ```

   - #### class（ts)

     public(属性和方法的默认修饰符) private 和 protected

   ```js
   //TypeScript 中类的用法
   //public(属性和方法的默认修饰符) private 和 protected
   //private
   class Animal5 {
       private name;
       public constructor(name) {
           this.name = name;
       }
   }
   let animal5 = new Animal5('Jack');
   // console.log(animal5.name); // error:
   // animal5.name = 'Tom'; //error:不能访问私有变量
   //子类也不能访问父类的私有
   //protected 修饰符也是私有变量，允许在子类中访问
   ```

   ​		abstract  *抽象类*

   ```ts
   abstract class Animal7{
       abstract name;//抽象属性，很少这么用
       constructor(name){//抽象类不能new对象
           //this.name = name;//
       }
       public abstract showName();//抽象方法
   }
   
   ```

   - #### interface  *接口*

   ```ts
   interface Name {
     first: string;
     second: string;
     three?: string; // 非必填
   }
   
   let name: Name;
   name = {
     first: 'John',
     second: 'Doe'
   };
   
   name = {
     // Error: 'Second is missing'
     first: 'John'
   };
   
   name = {
     // Error: 'Second is the wrong type'
     first: 'John',
     second: 1337
   };
   
   ```

   ##### 	接口拓展

   ```ts
   // Lib a.d.ts
   interface Point {
     x: number,
     y: number
   }
   declare const myPoint: Point
   
   // Lib b.d.ts
   interface Point {
     z: number
   }
   
   // Your code
   myPoint.z // Allowed!
   ```

   ##### 类实现接口

   ```ts
   interface Point {
     x: number;
     y: number;
   }
   
   class MyPoint implements Point {
     x: number;
     y: number; // Same as Point
   }
   
   nterface Point {
     x: number;
     y: number;
     z: number; // New member
   }
   
   class MyPoint implements Point {
     // ERROR : missing member `z` 保持同步
     //implements实现
     x: number;
     y: number;
   }
   ```

   ```ts
   interface Crazy {
     new (): {
       hello: number;
     };
     //aaa (): {
     //  hello: number;
     //};
   }
   class CrazyClass implements Crazy {
     constructor() {
       return { hello: 123 };
     }
     //aaa () {
     //  return { hello: 123 };
     //}
   }
   //实测这个会报错，new换成其他方法就可以
   // Because
   const crazy = new CrazyClass(); // crazy would be { hello:123 }
   ```

   

   

   3. ##### 内联类型注解

   ```ts
   let name: {
     first: string;
     second: string;
   };
   
   name = {
     first: 'John',
     second: 'Doe'
   };
   
   name = {
     // Error: 'Second is missing'
     first: 'John'
   };
   
   name = {
     // Error: 'Second is the wrong type'
     first: 'John',
     second: 1337
   };
   ```

   4. ##### 泛型

   许多算法和数据结构并不会依赖于对象的实际类型。但是，你仍然会想在每个变量里强制提供约束

   ```ts
   function reverse<T>(items: T[]): T[] {
       //T 代表 Type，在定义泛型时通常用作第一个类型变量名称,T不是必须，随便什么单词都行
       //以下是常见泛型变量代表的意思：
       //K（Key）：表示对象中的键类型；
   	//V（Value）：表示对象中的值类型；
   	//E（Element）：表示元素类型。
     const toreturn = [];
     for (let i = items.length - 1; i >= 0; i--) {
       toreturn.push(items[i]);
     }
     return toreturn;
   }
   
   const sample = [1, 2, 3];
   let reversed = reverse(sample);
   
   console.log(reversed); // 3, 2, 1
   
   // Safety
   reversed[0] = '1'; // Error
   reversed = ['1', '2']; // Error
   
   reversed[0] = 1; // ok
   reversed = [1, 2]; // ok
   
   
   function identity <T, U>(value: T, message: U) : T {
     console.log(message);
     return value;
   }
   console.log(identity<Number, string>(68, "Semlinker"));
   //泛型接口
   interface Identities<V, M> {
     value: V,
     message: M
   }
   
   ```

   ##### 泛型接口

   ```ts
   interface Identities<V, M> {
     value: V,
     message: M
   }
   function identity<T, U> (value: T, message: U): Identities<T, U> {
     console.log(value + ": " + typeof (value));
     console.log(message + ": " + typeof (message));
     let identities: Identities<T, U> = {
       value,
       message
     };
     return identities;
   }
   
   console.log(identity(68, "Semlinker"));
   
   ```

   ##### 泛型类

   ```ts
   interface GenericInterface<U> {
     value: U
     getIdentity: () => U
   }
   
   class IdentityClass<T> implements GenericInterface<T> {
       //implements 实现，意思是IdentityClass必须满足GenericInterface
       //GenericInterface修改之后，可能会导致IdentityClass错误，方便同步代码
   
     value: T
   
     constructor(value: T) {
       this.value = value
     }
   
     getIdentity(): T {
       return this.value
     }
   
   }
   
   const myNumberClass = new IdentityClass<Number>(68);
   console.log(myNumberClass.getIdentity()); // 68
   
   const myStringClass = new IdentityClass<string>("Semlinker!");
   console.log(myStringClass.getIdentity()); // Semlinker!
   ```

   ##### 泛型约束

   确保属性存在

   ```ts
   function identity<T>(arg: T): T {
     console.log(arg.length); // Error
     return arg;
   }
   
   interface Length {
     length: number;
   }
   function identity<T extends Length>(arg: T): T {
     console.log(arg.length); // 可以获取length属性
     return arg;
   }
   
   ```

   ###### 检查对象上的键是否存在

   ```ts
   interface Person {
     name: string;
     age: number;
     location: string;
   }
   //keyof 操作符是在 TypeScript 2.1 版本引入的，该操作符可以用于获取某种类型的所有键，其返回类型是联合类型
   type K1 = keyof Person; // "name" | "age" | "location"
   type K2 = keyof Person[];  // number | "length" | "push" | "concat" | ...
   type K3 = keyof { [x: string]: Person };  // string | number  ???
   
   function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
     return obj[key];
   }
   ```

   5. ##### 联合类型

      联合类型也是将多个类型合并为一个类型, 表示"**或**"的关系,用`|`连接多个类型:

   ```ts
   function setWidth(el: HTMLElement, width: string | number) {
       el.style.width = 'number' === typeof width ? `${width}px` : width;
   }
   ```

   

   6. ##### 交叉类型

      表示"**并且**"的关系,用`&`连接多个类型, 常用于对象合并:

   ```ts
   interface A {a:number};
   interface B {b:string};
   
   const a:A = {a:1};
   const b:B = {b:'1'};
   const ab:A&B = {...a,...b};
   ```

   

   7. ##### 类型别名

   ```ts
   type StrOrNum = string | number;
   
   // 使用
   let sample: StrOrNum;
   sample = 123;
   sample = '123';
   
   // 会检查类型
   sample = true; // Error
   
   type Text = string | { text: string };
   type Coordinates = [number, number];
   type Callback = (data: string) => void;
   ```

   建议使用接口，接口能用implements和extends，功能强大。类型别名更多的用在语义化一些交叉和联合类型

   

- #### 环境声明

  **声明文件是给js代码补充类型标注**. 这样在ts编译环境下就不会提示js文件"缺少类型".

  即便你只写js代码, 也可以安装声明文件, 因为如果你用的是**vscode**, 那么他会自动分析js代码, 如果存在对应的声明文件, vscode会把声明文件的内容作为**代码提示**.

  声明变量使用关键字`declare`来表示声明其后面的**全局**变量的类型,

```ts
declare var foo: any;
foo = 123; // allow
```

​		声明文件的文件名必须以`.d.ts`结尾,声明文件放在项目里的**任意路径/文件名**都可以被ts编译器识别, 但实际开发中**推荐放在根目录下**.

##### 	@types

​	比较热门的插件一般有对应的声明文件，比如jquery的声明文件就可以这样:

```shell
npm install @types/jquery --save-dev

import * as $ from 'jquery';

// 现在你可以此模块中任意使用$了 :)
```

​	可以通过配置 `tsconfig.json` 的 `compilerOptions.types` 选项，引入有意义的类型：

```ts
{
  "compilerOptions": {
    "types" : [
      "jquery"
    ]
  }
}
```

- #### 字面量

  字面量的意思就是直接声明, 而非**new**关键词实例化出来的数据:

  ```ts
  // 字面量
  const n:number = 123;
  const s:string = '456';
  const o:object = {a:1,b:'2'};
  
  // 非字面量
  const n:Number = new Number(123);
  const s:String = new String('456');
  const o:Object = new Object({a:1,b:'2'});
  
  //ts中用小写字母开头的类型代表字面量, 大写的是用来表示通过new实例化的数据
  ```



- #### 类型断言

  TypeScript 允许你覆盖它的推断，并且能以你任何你想要的方式分析它，这种机制被称为「类型断言」。TypeScript 类型断言用来告诉编译器你比它更了解这个类型，并且它不应该再发出错误。

  ```ts
  const foo = {};
  foo.bar = 123; // Error: 'bar' 属性不存在于 ‘{}’
  foo.bas = 'hello'; // Error: 'bas' 属性不存在于 '{}'
  interface Foo {
    bar: number;
    bas: string;
  }
  
  const foo = {} as Foo;
  foo.bar = 123;
  foo.bas = 'hello';
  ```

  最开始断言是这样的：

  ```ts
  let foo: any;
  let bar = <string>foo; // 现在 bar 的类型是 'string'
  //现在也可以这样写，但是和JSX冲突，建议用as
  ```



- #### 类型索引（keyof）

  ts中的keyof和js中的Object.keys类似, 可以用来获取对象类型的键值（区别是ts里获取的结果是联合类型）:

  ```ts
  type A = keyof {a:1,b:'123'} // 'a'|'b'
  type B = keyof [1,2] // '0'|'1'|'push'... , 多了Array原型上的方法和属性
  let c:A = 'c' // 错误, 值只能是a或者b
  ```

- #### 映射类型(Readonly, Pick, Record等...)

  看Readonly之前先看一下readonly：

  TypeScript 类型系统允许你在一个接口里使用 `readonly` 来标记属性

  ```ts
  function foo(config: { readonly bar: number, readonly bas: number }) {
    // ..
  }
  
  const config = { bar: 123, bas: 123 };
  foo(config);
  
  // 现在你能够确保 'config' 不能够被改变了
  
  type Foo = {
    readonly bar: number;
    readonly bas: number;
  };
  
  // 初始化
  const foo: Foo = { bar: 123, bas: 456 };
  
  // 不能被改变
  foo.bar = 456; // Error: foo.bar 为仅读属性
  
  class Foo {
    readonly bar = 1; // OK
    readonly baz: string;
    constructor() {
      this.baz = 'hello'; // OK
    }
  }
  //interface 里一样
  ```

  映射类型比较像修改类型的工具函数, 比如**Readonly**可以把每个属性都变成只读:

  ```ts
  type A  = {a:number, b:string}
  type A1 = Readonly<A> // {readonly a: number;readonly b: string;}
  //ts源码中Readonly
  type Readonly<T> = {
      readonly [P in keyof T]: T[P];
  };
  ```

  ##### `Partial<T>`, 让属性都变成可选的

  ```ts
  type A  = {a:number, b:string}
  type A1 = Partial<A> // { a?: number; b?: string;}
  ```

  ##### `Required<T>`, 让属性都变成必选

  ```ts
  type A  = {a?:number, b?:string}
  type A1 = Required<A> // { a: number; b: string;}
  ```

  ##### `Pick<T,K>`, 只保留自己选择的属性, K代表要保留的属性键值

  ```ts
  type A  = Pick<{a:number,b:string,c:boolean}, 'a'|'b'>//{a:number,b:string}
  ```

  ##### `Omit<T,K>` 实现排除已选的属性

  ```ts
  type A  = {a:number, b:string}
  type A1 = Omit<A, 'a'> // {b:string}
  ```

  ##### `Record<K,T>`, 创建一个类型,K代表键值的类型, T代表值的类型

  ```ts
  type A1 = Record<string, string> // 等价{[x:string]:string}
  ```

  ![image-20210601185649213](https://file.40017.cn/baoxian/health/health_public/images/blog/image-fail.png)

  

- #### extends(条件类型)

  ```ts
  T extends U ? X : Y
  ```

  用来表示类型是不确定的, 如果`U`的类型可以表示`T`, 那么返回`X`, 否则`Y`

  ```ts
  type A =  string extends '123' ? string :'123' // '123'
  type B =  '123' extends string ? string :123 // string
  ```

- #### 函数

  1. 参数注解

     ```ts
     function foo(sampleParameter: { bar: number }) {}
     ```

  2. 返回类型注解

     ```ts
     interface Foo {
       foo: string;
     }
     
     // Return type annotated as `: Foo`
     function foo(sample: Foo): Foo {
       return sample;
     }
     
     
     //不注解函数的返回类型的话，编译器会推断类型
     function foo(sample: Foo) {
       return sample; // inferred return type 'Foo'
     }
     ```

  3. 可选参数

     ```ts
     function foo(bar: number, bas?: string): void {
       // ..
     }
     
     foo(123);
     foo(123, 'hello');
     //当调用者没有提供该参数时，你可以提供一个默认值（在参数声明后使用 = someValue ）
     function foo(bar: number, bas: string = 'hello') {
       console.log(bar, bas);
     }
     
     foo(123); // 123, hello
     foo(123, 'world'); // 123, world
     ```

  4. ###### 重载

     ```ts
     // 重载
     function padding(all: number);
     function padding(topAndBottom: number, leftAndRight: number);
     function padding(top: number, right: number, bottom: number, left: number);
     // Actual implementation that is a true representation of all the cases the function body needs to handle
     function padding(a: number, b?: number, c?: number, d?: number) {
       if (b === undefined && c === undefined && d === undefined) {
         b = c = d = a;
       } else if (c === undefined && d === undefined) {
         c = a;
         d = b;
       }
       return {
         top: a,
         right: b,
         bottom: c,
         left: d
       };
     }
     
     padding(1); // Okay: all
     padding(1, 1); // Okay: topAndBottom, leftAndRight
     padding(1, 1, 1, 1); // Okay: top, right, bottom, left
     
     padding(1, 1, 1); // Error: Not a part of the available overloads
     //TypeScript 中的函数重载没有任何运行时开销。它只允许你记录希望调用函数的方式，
     ```

     ts的函数重载其实就是： 多个函数函数名相同，函数的参数类型,顺序,个数不同。注意函数重载与返回值类型无关。ts的函数重载比较鸡肋，最终函数逻辑的实现还是在一个函数体内去判断它的参数类型，然后做相应的操作。ts重载的作用，感觉只是多了一个参数校验的功能。也就是说在进行函数调用的时候，会对参数进行检查，只有传入的参数类型，顺序，个数与定义的重载函数的参数相同，才能调用成功，否则报错。返回值类型不会进行校验（函数重载与返回值类型无关）

  5. ##### 函数声明

     ```ts
     //两种方式
     type LongHand = {
       (a: number): number;
     };
     //let sdasdasd:LongHand=function (a:number): number{
     //  return a
     //}
     type ShortHand = (a: number) => number;
     
     //let sdasdasd:ShortHand=function (a:number): number{
     //  return a
     //}
     
     //使用重载时只能用上一种方式
     type LongHandAllowsOverloadDeclarations = {
       (a: number): number;
       (a: string): string;
     };
     ```

