---
title: Flutter学习笔记
tags:
  - 笔记
  - 学习
  - flutter
  - 待续
createTime: 2024/10/25 14:38:26
permalink: /article/l8os2vws/
---
# Flutter



## Dart语言基础



### 类型变量



- 在Dart中，所有类型都是对象类型，都继承自顶层类型Object，因此一切变量都是对象，数字、布尔值、函数和null也概莫能外；
- 未初始化变量的值都是null；
- 为变量指定类型，这样编辑器和编译器都能更好地理解你的意图。



### 函数



**Dart认为重载会导致混乱，因此从设计之初就不支持重载，而是提供了可选命名参数和可选参数**。

具体方式是，在声明函数时：

- 给参数增加{}，以paramName: value的方式指定调用参数，也就是可选命名参数；
- 给参数增加[]，则意味着这些参数是可以忽略的，也就是可选参数。



### 类



Dart中并没有public、protected、private这些关键字，我们只要在声明变量与方法时，在前面加上“\_”即可作为private方法使用。如果不加“\_”，则默认为public。不过，**“_”的限制范围并不是类访问级别的，而是库访问级别**。



### 复用



在面向对象的编程语言中，将其他类的变量与方法纳入本类中进行复用的方式一般有两种：**继承父类和接口实现**。当然，在Dart也不例外。

在Dart中，你可以对同一个父类进行继承或接口实现：

- 继承父类意味着，子类由父类派生，会自动获取父类的成员变量和方法实现，子类可以根据需要覆写构造函数及父类方法；
- 接口实现则意味着，子类获取到的仅仅是接口的成员变量符号和方法符号，需要重新实现成员变量，以及方法的声明和初始化，否则编译器会报错。



**除了继承和接口实现之外，Dart还提供了另一种机制来实现类的复用，即“混入”（Mixin）**。混入鼓励代码重用，可以被视为具有实现方法的接口。这样一来，不仅可以解决Dart缺少对多重继承的支持问题，还能够避免由于多重继承可能导致的歧义（菱形问题）。

> 备注：继承歧义，也叫菱形问题，是支持多继承的编程语言中一个相当棘手的问题。当B类和C类继承自A类，而D类继承自B类和C类时会产生歧义。如果A中有一个方法在B和C中已经覆写，而D没有覆写它，那么D继承的方法的版本是B类，还是C类的呢？

**要使用混入，只需要with关键字即可。**



### 运算符



Dart和绝大部分编程语言的运算符一样，所以你可以用熟悉的方式去执行程序代码运算。不过，**Dart多了几个额外的运算符，用于简化处理变量实例缺失（即null）的情况**。

- **?.**运算符：假设Point类有printInfo()方法，p是Point的一个可能为null的实例。那么，p调用成员方法的安全代码，可以简化为`p?.printInfo() `，表示p为null的时候跳过，避免抛出异常。
- **??=** 运算符：如果a为null，则给a赋值value，否则跳过。这种用默认值兜底的赋值语句在Dart中我们可以用`a ??= value`表示。
- **??**运算符：如果a不为null，返回a的值，否则返回b。在Java或者C++中，我们需要通过三元表达式`(a != null)? a : b`来实现这种情况。而在Dart中，这类代码可以简化为`a ?? b`。

**在Dart中，一切都是对象，就连运算符也是对象成员函数的一部分。**



### 购物车DEMO



```dart
// 首先，Item类与ShoppingCart类中都有一个name属性，在Item中表示商品名称，在ShoppingCart中则表示用户名；
// 然后，Item类中有一个price属性，ShoppingCart中有一个price方法，它们都表示当前的价格。
// 考虑到name属性与price属性（方法）的名称与类型完全一致，在信息表达上的作用也几乎一致，因此我可以在这两个类的基础上，再抽象出一个新的基类Meta，用于存放price属性与name属性。
class Meta {
  double price;
  String name;
  Meta(this.name, this.price);
}
// 关于购物车信息的打印，我们是通过在main函数中获取到购物车对象的信息后，使用全局的print函数打印的，我们希望把打印信息的行为封装到ShoppingCart类中。
// 而对于打印信息的行为而言，这是一个非常通用的功能，不止ShoppingCart类需要，Item对象也可能需要。
// 因此，我们需要把打印信息的能力单独封装成一个单独的类PrintHelper。
// 但，ShoppingCart类本身已经继承自Meta类，考虑到Dart并不支持多继承，所以这里使用“混入”（Mixin）。
mixin PrintHelper {
  printInfo() => print(getInfo());
  getInfo();
}
// 定义商品Item类
class Item extends Meta with PrintHelper {
  num number;
  Item(super.name, super.price, this.number);
  // 重载了+运算符，合并商品为套餐商品，就是将两个实例的name和price做+运算，得到一个新的实例，新实例的价格就是累加的结果
  Item operator+(Item item) => Item(name + item.name, price * number + item.price, 1);

  @override
  getInfo () => '''
    -------------------------
    商品名称: $name
    商品价格: $price
    商品数量: $number
    -------------------------
  ''';
}

// 定义购物车类
class ShoppingCart extends Meta with PrintHelper {
  DateTime date;
  String code;
  List<Item> bookings = [];

  @override
  // 考虑到在ShoppingCart类中，price属性仅用做计算购物车中商品的价格（而不是像Item类那样用于数据存取），因此在继承了Meta类后，改写了ShoppingCart类中price属性的get方法
  // 把迭代求和改写为归纳合并
  // value + element中的运算符已被Item类重载，所以对象之间可以直接使用运算
  double get price => bookings.reduce((value, element) => value + element).price;

  num get number => bookings.length;

  String get goodsInfo => bookings.map((item) => item.getInfo()).join('\n');

  // 提供给调用者更明确的初始化方法调用方式，让调用者以“参数名:参数键值对”的方式指定调用参数，让调用者明确传递的初始化参数的意义。
  // 对一个购物车对象来说，一定会有一个有用户名，但不一定有优惠码的用户。
  // 因此，对于购物车对象的初始化，我们还需要提供一个不含优惠码的初始化方法，并且需要确定多个初始化方法与父类的初始化方法之间的正确调用顺序。
  // 默认初始化方法，转发到withCode里
  ShoppingCart({name}) : this.withCode(name:name, code:'');
  // withCode初始化方法，使用语法糖和初始化列表进行赋值，并调用父类初始化方法
  ShoppingCart.withCode({name, required this.code}) : date = DateTime.now(), super(name,0);

  @override
  getInfo () => '''
购物车信息:
-----------------------------
  用户名: $name
  优惠码: ${code == ''?"没有":code}
  商品详情:
$goodsInfo
  商品总数: $number
  总价: $price
  Date: $date
-----------------------------
''';
}

void main() {
  // 使用级联运算符“..”，在同一个对象上连续调用多个函数以及访问成员变量。使用级联操作符可以避免创建临时变量，让代码看起来更流畅。
  ShoppingCart.withCode(name:'张三', code:'123456')
    ..bookings = [Item('苹果', 10.0, 1), Item('鸭梨', 20.0, 2)]
    ..printInfo();

  ShoppingCart(name:'李四')
    ..bookings = [Item('香蕉', 15.0, 3), Item('西瓜', 40.0, 1)]
    ..printInfo();
}
```



## Flutter基础



### Widget



**Flutter的核心设计思想便是“一切皆Widget”**。

Widget是Flutter世界里对视图的一种结构化描述，你可以把它看作是前端中的“控件”或“组件”。Widget是控件实现的基本逻辑单位，里面存储的是有关视图渲染的配置信息，包括布局、渲染属性、事件响应信息等。

Flutter将Widget设计成不可变的，所以当视图渲染的配置信息发生变化时，Flutter会选择重建Widget树的方式进行数据更新，以数据驱动UI构建的方式简单高效。



#### Element



Element是Widget的一个实例化对象，它承载了视图构建的上下文数据，是连接结构化的配置信息到完成最终渲染的桥梁。

Flutter渲染过程，可以分为这么三步：

- 首先，通过Widget树生成对应的Element树；
- 然后，创建相应的RenderObject并关联到`Element.renderObject`属性上；
- 最后，构建成RenderObject树，以完成最终的渲染。

因为Widget具有不可变性，但Element却是可变的。实际上，Element树这一层将Widget树的变化（类似React 虚拟DOM diff）做了抽象，可以只将真正需要修改的部分同步到真实的RenderObject树中，最大程度降低对真实渲染视图的修改，提高渲染效率，而不是销毁整个渲染视图树重建。

这，就是Element树存在的意义。



#### RenderObject



Flutter通过控件树（Widget树）中的每个控件（Widget）创建不同类型的渲染对象，组成渲染对象树。

而渲染对象树在Flutter的展示过程分为四个阶段，即布局、绘制、合成和渲染。 其中，布局和绘制在RenderObject中完成，Flutter采用深度优先机制遍历渲染对象树，确定树中各个对象的位置和尺寸，并把它们绘制到不同的图层上。绘制完毕后，合成和渲染的工作则交给Skia搞定。

Flutter通过引入Widget、Element与RenderObject这三个概念，把原本从视图数据到视图渲染的复杂构建过程拆分得更简单、直接，在易于集中治理的同时，保证了较高的渲染效率。



### Widget中的State



Widget有StatelessWidget和StatefulWidget两种类型。StatefulWidget应对有交互、需要动态变化视觉效果的场景，而StatelessWidget则用于处理静态的、无状态的视图展示。**Flutter的视图开发是声明式的，其核心设计思想就是将视图和数据分离，这与React的设计思路完全一致**。**命令式编程强调精确控制过程细节；而声明式编程强调通过意图输出结果整体。**

**当你所要构建的用户界面不随任何状态信息的变化而变化时，需要选择使用StatelessWidget，反之则选用StatefulWidget。**



#### StatelessWidget



在Flutter中，Widget采用由父到子、自顶向下的方式进行构建，父Widget控制着子Widget的显示样式，其样式配置由父Widget在构建时提供。

用这种方式构建出的Widget，有些（比如Text、Container、Row、Column等）在创建时，除了这些配置参数之外不依赖于任何其他信息，换句话说，它们一旦创建成功就不再关心、也不响应任何数据变化进行重绘。在Flutter中，**这样的Widget被称为StatelessWidget（无状态组件）**。



#### StatefulWidget



与StatelessWidget相对应的，有一些Widget（比如Image、Checkbox）的展示，除了父Widget初始化时传入的静态配置之外，还需要处理用户的交互（比如，用户点击按钮）或其内部数据的变化（比如，网络数据回包），并体现在UI上。

换句话说，这些Widget创建完成后，还需要关心和响应数据变化来进行重绘。在Flutter中，**这一类Widget被称为StatefulWidget（有状态组件）**。

Widget是不可变的，发生变化时需要销毁重建，所以谈不上状态。StatefulWidget是以State类代理Widget构建的设计方式实现的。



#### 合理选择State



因为Widget是不可变的，更新则意味着销毁+重建（build）。StatelessWidget是静态的，一旦创建则无需更新；而对于StatefulWidget来说，在State类中调用setState方法更新数据，会触发视图的销毁和重建，也将间接地触发其每个子Widget的销毁和重建。

**如果我们的根布局是一个StatefulWidget，在其State中每调用一次更新UI，都将是一整个页面所有Widget的销毁和重建**。

虽然Flutter内部通过Element层可以最大程度地降低对真实渲染视图的修改，提高渲染效率，而不是销毁整个RenderObject树重建。但，大量Widget对象的销毁重建是无法避免的。如果某个子Widget的重建涉及到一些耗时操作，那页面的渲染性能将会急剧下降。

因此，**正确评估你的视图展示需求，避免无谓的StatefulWidget使用，是提高Flutter应用渲染性能最简单也是最直接的手段**。



### 生命周期



#### State生命周期



State的生命周期可以分为3个阶段：创建（插入视图树）、更新（在视图树中存在）、销毁（从视图树中移除）。

![aacfcfdb80038874251aa8ad93930abc](https://file.40017.cn/baoxian/health/health_public/images/blog/bba88ebb44b7fdd6735f3ddb41106784.png)

![aacfcfdb80038874251aa8ad93930abc](https://file.40017.cn/baoxian/health/health_public/images/blog/aacfcfdb80038874251aa8ad93930abc.png)



#### App生命周期



视图的生命周期，定义了视图的加载到构建的全过程，其回调机制能够确保我们可以根据视图的状态选择合适的时机做恰当的事情。而App的生命周期，则定义了App从启动到退出的全过程。

Flutter中，我们可以利用**WidgetsBindingObserver**类来实现。

```dart
abstract class WidgetsBindingObserver {
  //页面pop
  Future<bool> didPopRoute() => Future<bool>.value(false);
  //页面push
  Future<bool> didPushRoute(String route) => Future<bool>.value(false);
  //系统窗口相关改变回调，如旋转
  void didChangeMetrics() { }
  //文本缩放系数变化
  void didChangeTextScaleFactor() { }
  //系统亮度变化
  void didChangePlatformBrightness() { }
  //本地化语言变化
  void didChangeLocales(List<Locale> locale) { }
  //App生命周期变化
  void didChangeAppLifecycleState(AppLifecycleState state) { }
  //内存警告回调
  void didHaveMemoryPressure() { }
  //Accessibility相关特性回调
  void didChangeAccessibilityFeatures() {}
}
```

其他的回调相对简单，可以参考[官方文档](https://api.flutter.dev/flutter/widgets/WidgetsBindingObserver-class.html)。



在下面的代码中，我们在initState时注册了监听器，在didChangeAppLifecycleState回调方法中打印了当前的App状态，最后在dispose时把监听器移除：

```dart
class _MyHomePageState extends State<MyHomePage>  with WidgetsBindingObserver{
  ...
  @override
  @mustCallSuper
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);//注册监听器
  }
  @override
  @mustCallSuper
  void dispose(){
    super.dispose();
    WidgetsBinding.instance.removeObserver(this);//移除监听器
  }
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) async {
    print("$state");
    // resumed：可见的，并能响应用户的输入。
    // inactive：处在不活动状态，无法处理用户响应。
    // paused：不可见并不能响应用户的输入，但是在后台继续活动中。
    if (state == AppLifecycleState.resumed) {
      //do sth
    }
  }
}
```

我们试着切换一下前、后台，观察控制台输出的App状态，可以发现：

- 从后台切入前台，控制台打印的App生命周期变化如下: `AppLifecycleState.paused`->`AppLifecycleState.inactive`->`AppLifecycleState.resumed`；
- 从前台退回后台，控制台打印的App生命周期变化则变成了：`AppLifecycleState.resumed`->`AppLifecycleState.inactive`->`AppLifecycleState.paused`。

![2880ffdbe3c5df3552c0b22c34157ae6](https://file.40017.cn/baoxian/health/health_public/images/blog/2880ffdbe3c5df3552c0b22c34157ae6.png)



#### 帧绘制回调



除了需要监听App的生命周期回调做相应的处理之外，有时候我们还需要在组件渲染之后做一些与显示安全相关的操作。**在Flutter中实现同样的需求会更简单**：依然使用万能的WidgetsBinding来实现。

WidgetsBinding提供了单次Frame绘制回调，以及实时Frame绘制回调两种机制，来分别满足不同的需求：

- 单次Frame绘制回调，通过addPostFrameCallback实现。它会在当前Frame绘制完成后进行进行回调，并且只会回调一次，如果要再次监听则需要再设置一次。

```dart
WidgetsBinding.instance.addPostFrameCallback((_){
    print("单次Frame绘制回调");//只回调一次
  });
```

- 实时Frame绘制回调，则通过addPersistentFrameCallback实现。这个函数会在每次绘制Frame结束后进行回调，可以用做FPS监测。

```dart
WidgetsBinding.instance.addPersistentFrameCallback((_){
  print("实时Frame绘制回调");//每帧都回调
});
```



#### 生命周期回调DEMO



**main.dart**

```dart
import 'package:flutter/material.dart';
import './page1.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'Flutter Demo',
        theme: ThemeData(
          primarySwatch: Colors.blue,
        ),
        home: const Page1(key: Key('1'),)
    );
  }
}
```

**page1.dart**

```dart
import 'package:flutter/material.dart';
import './page2.dart';

class Page1 extends StatefulWidget {
  const Page1({required Key key}) : super(key: key);
  @override
  Page1State createState() => Page1State();
}

class Page1State extends State<Page1> with WidgetsBindingObserver{

  //当Widget第一次插入到Widget树时会被调用。对于每一个State对象，Flutter只会调用该回调一次
  @override
  void initState() {
    super.initState();
    print("page1 initState......");
    WidgetsBinding.instance.addObserver(this);//注册监听器

    WidgetsBinding.instance.addPostFrameCallback((_){
      print("单次Frame绘制回调");//只回调一次
    });

    WidgetsBinding.instance.addPersistentFrameCallback((_){
      print("实时Frame绘制回调");//每帧都回调
    });
  }

  @override
  void setState(fn) {
    super.setState(fn);
    print("page1 setState......");

  }

  /*
  *初始化时，在initState之后立刻调用
  *当State的依赖关系发生变化时，会触发此接口被调用
  */
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    print("page1 didChangeDependencies......");
  }

  //绘制界面
  @override
  Widget build(BuildContext context) {
    print("page1 build......");
    return Scaffold(
      appBar: AppBar(title: const Text("Lifecycle demo")),
      body: Center(
        child: Column(
          children: <Widget>[
            ElevatedButton(
              child: const Text("打开/关闭新页面查看状态变化"),
              onPressed: ()=> Navigator.push(
                context, MaterialPageRoute(builder: (context) => const Parent(key: Key('1'),)),
              ),
            )
          ],
        ),),
    );

  }

  //状态改变的时候会调用该方法,比如父类调用了setState
  @override
  void didUpdateWidget(Page1 oldWidget) {
    super.didUpdateWidget(oldWidget);
    print("page1 didUpdateWidget......");
  }

  //当State对象从树中被移除时，会调用此回调
  @override
  void deactivate() {
    super.deactivate();
    print('page1 deactivate......');
  }

  //当State对象从树中被永久移除时调用；通常在此回调中释放资源
  @override
  void dispose() {
    super.dispose();
    print('page1 dispose......');
    WidgetsBinding.instance.removeObserver(this);//移除监听器
  }

  //监听App生命周期回调
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) async {
    print("$state");
    if (state == AppLifecycleState.resumed) {
      //do sth
    }
  }
}
```

**page2.dart**

```dart
import 'package:flutter/material.dart';

class Parent extends StatefulWidget {
  const Parent({required Key key}) : super(key: key);

  @override
  ParentState createState() => ParentState();
}

class ParentState extends State<Parent> {
  int _counter = 0;

  //当Widget第一次插入到Widget树时会被调用。对于每一个State对象，Flutter只会调用该回调一次
  @override
  void initState() {
    super.initState();
    print("page2 parent initState......");
  }

  @override
  void setState(fn) {
    super.setState(fn);
    print("page2 parent setState......");

  }

  /*
  *初始化时，在initState之后立刻调用
  *当State的依赖关系发生变化时，会触发此接口被调用
  */
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    print("page2 parent didChangeDependencies......");
  }

  //绘制界面
  @override
  Widget build(BuildContext context) {
    print("page2 parent build......");
    return Scaffold(
      appBar: AppBar(title: const Text("setState demo")),
      body: Center(
          child: ElevatedButton(
            ///点击事件
            onPressed: () {
              setState(() {
                _counter++;
              });
            },
            child: Child(count:_counter, key: const Key('1')),
          )),
    );

  }

  //状态改变的时候会调用该方法,比如父类调用了setState
  @override
  void didUpdateWidget(Parent oldWidget) {
    super.didUpdateWidget(oldWidget);
    print("page2 parent didUpdateWidget......");
  }

  //当State对象从树中被移除时，会调用此回调
  @override
  void deactivate() {
    super.deactivate();
    print('page2 parent deactivate......');
  }

  //当State对象从树中被永久移除时调用；通常在此回调中释放资源
  @override
  void dispose() {
    super.dispose();
    print('page2 parent dispose......');
  }
}

class Child extends StatefulWidget {
  final int count;
  const Child({required Key key, required this.count}) : super(key: key);

  @override
  ChildState createState() => ChildState();
}

class ChildState extends State<Child> {
  //绘制界面
  @override
  Widget build(BuildContext context) {
    print("child build......");
    return Text('点击按钮查看状态变化 count: ${widget.count}');
  }

  //当Widget第一次插入到Widget树时会被调用。对于每一个State对象，Flutter只会调用该回调一次
  @override
  void initState() {
    super.initState();
    print("page2 child initState......");
  }

  /*
  *初始化时，在initState之后立刻调用
  *当State的依赖关系发生变化时，会触发此接口被调用
  */
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    print("page2 child didChangeDependencies......");
  }

  //状态改变的时候会调用该方法,比如父类调用了setState
  @override
  void didUpdateWidget(Child oldWidget) {
    super.didUpdateWidget(oldWidget);
    print("page2 child didUpdateWidget......");
  }

  //当State对象从树中被移除时，会调用此回调
  @override
  void deactivate() {
    super.deactivate();
    print('page2 child deactivate......');
  }

  //当State对象从树中被永久移除时调用；通常在此回调中释放资源
  @override
  void dispose() {
    super.dispose();
    print('page2 child dispose......');
  }
}
```



## 基础组件



### 文本控件



Text支持两种类型的文本展示，一个是默认的展示单一样式的文本`Text`，另一个是支持多种混合样式的富文本`Text.rich`。

单一样式文本Text的初始化，是要传入需要展示的字符串。而这个字符串的具体展示效果，受构造函数中的其他参数控制。这些参数大致可以分为两类：

- **控制整体文本布局的参数**，如文本对齐方式textAlign、文本排版方向textDirection，文本显示最大行数maxLines、文本截断规则overflow等等，这些都是构造函数中的参数；
- **控制文本展示样式的参数**，如字体名称fontFamily、字体大小fontSize、文本颜色color、文本阴影shadows等等，这些参数被统一封装到了构造函数中的参数style中。

**混合展示样式与单一样式的关键区别在于分片**，即如何把一段字符串分为几个片段来管理，给每个片段单独设置样式。

TextSpan定义了一个字符串片段该如何控制其展示样式，而将这些有着独立展示样式的字符串组装在一起，则可以支持混合样式的富文本展示。



```dart
import 'package:flutter/material.dart';

TextStyle blackStyle = const TextStyle(fontWeight: FontWeight.normal, fontSize: 20, color: Colors.black); //黑色样式

TextStyle redStyle = const TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Colors.red); //红色样式

Text basicText = const Text(
'文本是视图系统中的常见控件，用来显示一段特定样式的字符串，就比如Android里的TextView，或是iOS中的UILabel。',
textAlign: TextAlign.center,//居中显示
style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20, color: Colors.red),//20号红色粗体展示
);

Text richText = Text.rich(
  TextSpan(
      children: <TextSpan>[
        TextSpan(text:'文本是视图系统中常见的控件，它用来显示一段特定样式的字符串，类似', style: redStyle), //第1个片段，红色样式
        TextSpan(text:'Android', style: blackStyle), //第1个片段，黑色样式
        TextSpan(text:'中的', style:redStyle), //第1个片段，红色样式
        TextSpan(text:'TextView', style: blackStyle) //第1个片段，黑色样式
      ]),
  textAlign: TextAlign.center,
);
```



### 图片



使用Image，可以让我们向用户展示一张图片。图片的显示方式有很多，比如资源图片、网络图片、文件图片等，图片格式也各不相同，因此在Flutter中也有多种方式，用来加载不同形式、支持不同格式的图片：

- 加载本地资源图片，如`Image.asset(‘images/logo.png’)`；
- 加载本地（File文件）图片，如`Image.file(new File(’/storage/xxx/xxx/test.jpg’))`；
- 加载网络图片，如`Image.network('http://xxx/xxx/test.gif') `。



```dart
import 'package:flutter/cupertino.dart';

Image assetImage = Image.asset('assets/cat.jpg');

FadeInImage networkImage = FadeInImage.assetNetwork(
  placeholder: 'assets/loading.gif', //gif占位
  image: 'https://xxxx.com/images/banner_bg.png',
  fit: BoxFit.cover, //图片拉伸模式
  width: 200,
  height: 200
);
```



> Flutter静态资源的读取需要在根目录下的`pubspec.yaml`文件下配置：
>
> ```yaml
> ...
> flutter:
> 
>   ...
> 
>   # To add assets to your application, add an assets section, like this:
>   assets:
>     - assets/
> ...
> ```



### 按钮



通过按钮，我们可以响应用户的交互事件。Flutter提供了一些基本的[按钮控件](https://m3.material.io/components/all-buttons)：

- onPressed参数用于设置点击回调，告诉Flutter在按钮被点击时通知我们。如果onPressed参数为空，则按钮会处于禁用状态，不响应用户点击。
- child参数用于设置按钮的内容，告诉Flutter控件应该长成什么样，也就是控制着按钮控件的基本样式。child可以接收任意的Widget，比如我们在上面的例子中传入的Text，除此之外我们还可以传入Image等控件。



```dart
import 'package:flutter/material.dart';

FloatingActionButton floatingActionButton = FloatingActionButton(onPressed: () => print('FloatingActionButton pressed'),child: const Text('Btn'),);
ElevatedButton elevatedButton = ElevatedButton(onPressed: () => print('ElevatedButton pressed'),child: const Text('Btn'),);
FilledButton filledButton = FilledButton(onPressed: () => print('FilledButton pressed'), child: const Text('Btn'),);
OutlinedButton outlinedButton = OutlinedButton(onPressed: () => print('OutlinedButton pressed'),child: const Text('Btn'),);
TextButton textButton = TextButton(onPressed: () => print('TextButton pressed'),child: const Text('Btn'),);
```



## 列表与滚动



### ListView



在Flutter中，ListView可以沿一个方向（垂直或水平方向）来排列其所有子Widget，因此常被用于需要展示一组连续视图元素的场景，比如通信录、优惠券、商家列表等。

**ListView提供了一个默认构造函数ListView**，我们可以通过设置它的children参数，很方便地将所有的子Widget包含到ListView中。

不过，这种创建方式要求提前将所有子Widget一次性创建好，而不是等到它们真正在屏幕上需要显示时才创建，所以有一个很明显的缺点，就是性能不好。因此，**这种方式仅适用于列表中含有少量元素的场景**。



```dart
import 'package:flutter/material.dart';

ListView listView = ListView(
    children: <Widget>[
      IconButton(onPressed: () {}, icon: const Icon(Icons.share_outlined)),
      const ListTile(leading: Icon(Icons.map),  title: Text('Map')),
      const ListTile(leading: Icon(Icons.message),  title: Text('Message')),
    ]
);
```



除了默认的垂直方向布局外，ListView还可以通过设置scrollDirection参数支持水平方向布局。如下所示，我定义了一组不同颜色背景的组件，将它们的宽度设置为140，并包在了水平布局的ListView中，让它们可以横向滚动：



```dart
ListView horizontalList = ListView(
    scrollDirection: Axis.horizontal,
    itemExtent: 140, //item延展尺寸(宽度)
    children: <Widget>[
          Container(color: Colors.black),
          Container(color: Colors.red),
          Container(color: Colors.blue),
          Container(color: Colors.green),
          Container(color: Colors.yellow),
          Container(color: Colors.orange),
    ]
);
```



考虑到创建子Widget产生的性能问题，更好的方法是抽象出创建子Widget的方法，交由ListView统一管理，在真正需要展示该子Widget时再去创建。

**ListView的另一个构造函数ListView.builder，则适用于子Widget比较多的场景**。这个构造函数有两个关键参数：

- itemBuilder，是列表项的创建方法。当列表滚动到相应位置时，ListView会调用该方法创建对应的子Widget。
- itemCount，表示列表项的数量，如果为空，则表示ListView为无限列表。



```dart
ListView listBuilder = ListView.builder(
    itemCount: 100, //元素个数
    itemExtent: 50.0, //列表项高度 这里需要注意的是，itemExtent并不是一个必填参数。但，对于定高的列表项元素，强烈建议提前设置好这个参数的值。
    itemBuilder: (BuildContext context, int index) => ListTile(title: Text("title $index"), subtitle: Text("body $index"))
);
```



在ListView中，有两种方式支持分割线：

- 一种是，在itemBuilder中，根据index的值动态创建分割线，也就是将分割线视为列表项的一部分；
- 另一种是，使用ListView的另一个构造方法ListView.separated，单独设置分割线的样式。



```dart
ListView listSeparated = ListView.separated(
    itemCount: 100,
    separatorBuilder: (BuildContext context, int index) => index %2 ==0? const Divider(color: Colors.green) : const Divider(color: Colors.red),//index为偶数，创建绿色分割线；index为奇数，则创建红色分割线
    itemBuilder: (BuildContext context, int index) => ListTile(title: Text("title $index"), subtitle: Text("body $index"))//创建子Widget
);
```



**ListView常见的构造方法及其适用场景**

![00e6c9f8724fcf50757b4a76fa4c9b18](https://file.40017.cn/baoxian/health/health_public/images/blog/00e6c9f8724fcf50757b4a76fa4c9b18.png)



### CustomScrollView



**当多ListView嵌套时，页面滑动效果不一致时**，在Flutter中有一个专门的控件CustomScrollView，用来处理多个需要自定义滚动效果的Widget。在CustomScrollView中，**这些彼此独立的、可滚动的Widget被统称为Sliver**。



以一个有着封面头图的列表为例，我们希望封面头图和列表这两层视图的滚动联动起来，当用户滚动列表时，头图会根据用户的滚动手势，进行缩小和展开。

经分析得出，要实现这样的需求，我们需要两个Sliver：作为头图的SliverAppBar，与作为列表的SliverList。具体的实现思路是：

- 在创建SliverAppBar时，把flexibleSpace参数设置为悬浮头图背景。flexibleSpace可以让背景图显示在AppBar下方，高度和SliverAppBar一样；
- 而在创建SliverList时，通过SliverChildBuilderDelegate参数实现列表项元素的创建；
- 最后，将它们一并交由CustomScrollView的slivers参数统一管理。



```dart
import 'package:flutter/material.dart';

CustomScrollView customScrollView = CustomScrollView(
    slivers: <Widget>[
      SliverAppBar(//SliverAppBar作为头图控件
        title: const Text('CustomScrollView Demo'),//标题
        floating: true,//设置悬浮样式
        flexibleSpace: Image.network("https://xxxx.com/banner_bg.png",fit:BoxFit.cover),//设置悬浮头图背景
        expandedHeight: 130,//头图控件高度
      ),
      SliverList(//SliverList作为列表控件
        delegate: SliverChildBuilderDelegate(
              (context, index) => Text('Item #$index'),//列表项创建方法
          childCount: 100,//列表元素个数
        ),
      ),
    ]
);
```



### ScrollController



在某些情况下，我们希望获取视图的滚动信息，并进行相应的控制。比如，列表是否已经滑到底（顶）了？如何快速回到列表顶部？

在Flutter中，我们可以**使用ScrollController进行滚动信息的监听，以及相应的滚动控制**。

ListView的组件控制器则是ScrollControler，我们可以通过它来获取视图的滚动信息，更新视图的滚动位置。

一般而言，获取视图的滚动信息往往是为了进行界面的状态控制，因此**ScrollController的初始化、监听及销毁需要与StatefulWidget的状态保持同步**。

如下代码所示，我们声明了一个有着100个元素的列表项，当滚动视图到特定位置后，用户可以点击按钮返回列表顶部：

- 首先，我们在State的初始化方法里，创建了ScrollController，并通过_controller.addListener注册了滚动监听方法回调，根据当前视图的滚动位置，判断当前是否需要展示“Top”按钮。
- 随后，在视图构建方法build中，我们将ScrollController对象与ListView进行了关联，并且在RaisedButton中注册了对应的回调方法，可以在点击按钮时通过_controller.animateTo方法返回列表顶部。
- 最后，在State的销毁方法中，我们对ScrollController进行了资源释放。



```dart
class _ScrollControllerState extends State<ScrollControllerWidget> {
  late ScrollController _controller;//ListView 控制器
  bool isToTop = false;// 标示目前是否需要启用 "Top" 按钮
  @override
  void initState() {
    _controller = ScrollController();
    _controller.addListener(() {// 为控制器注册滚动监听方法
      if(_controller.offset > 1000) {// 如果 ListView 已经向下滚动了 1000，则启用 Top 按钮
        setState(() {isToTop = true;});
      } else if(_controller.offset < 300) {// 如果 ListView 向下滚动距离不足 300，则禁用 Top 按钮
        setState(() {isToTop = false;});
      }
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Scroll Controller Widget")),
      body: Column(
        children: <Widget>[
          SizedBox(
            height: 40.0,
            child: FilledButton(onPressed: (isToTop ? () {
              if (isToTop) {
                _controller.animateTo(.0,
                    duration: const Duration(milliseconds: 200),
                    curve: Curves.ease
                ); // 做一个滚动到顶部的动画
              }
            } : null), child: const Text("Top"),),
          ),
          Expanded(
            child: ListView.builder(
              controller: _controller, // 初始化传入控制器
              itemCount: 100, // 列表元素总数
              itemBuilder: (context, index) =>
                  ListTile(title: Text("Index : $index")), // 列表项构造方法
            ),
          ),
        ],
      ),
    );
  }
  @override
  void dispose() {
    _controller.dispose(); // 销毁控制器
    super.dispose();
  }
}
```



### ScrollNotification



对于列表滚动是否已经开始，或者是否已经停下来了？则需要接收ScrollNotification通知进行滚动事件的获取。

在Flutter中，**ScrollNotification通知的获取是通过NotificationListener来实现的**。与ScrollController不同的是，NotificationListener是一个Widget，为了监听滚动类型的事件，我们需要将NotificationListener添加为ListView的父容器，从而捕获ListView中的通知。而这些通知，需要**通过onNotification回调函数实现监听逻辑**：

```dart
class ScrollNotificationWidget extends StatelessWidget {
  const ScrollNotificationWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'Scroll Notification Demo',
        home: Scaffold(
            appBar: AppBar(title: const Text('ScrollController Demo')),
            body: NotificationListener<ScrollNotification>(// 添加 NotificationListener 作为父容器
              onNotification: (scrollNotification) {// 注册通知回调
                if (scrollNotification is ScrollStartNotification) {// 滚动开始
                  print('Scroll Start');
                } else if (scrollNotification is ScrollUpdateNotification) {// 滚动位置更新
                  print('Scroll Update');
                } else if (scrollNotification is ScrollEndNotification) {// 滚动结束
                  print('Scroll End');
                }
                return true;
              },
              child: ListView.builder(
                itemCount: 30,// 列表元素个数
                itemBuilder: (context, index) => ListTile(title: Text("Index : $index")),// 列表项创建方法
              ),
            )
        )
    );
  }
}
```

相比于ScrollController只能和具体的ListView关联后才可以监听到滚动信息；通过NotificationListener则可以监听其子Widget中的任意ListView，不仅可以得到这些ListView的当前滚动位置信息，还可以获取当前的滚动事件信息 。



## 布局



Flutter提供了31种[布局Widget](https://flutter.dev/docs/development/ui/widgets/layout)，对布局控件的划分非常详细。



### 单子Widget布局



单子Widget布局类容器比较简单，一般用来对其唯一的子Widget进行样式包装，比如限制大小、添加背景色样式、内间距、旋转变换等。这一类布局Widget，包括Container、Padding与Center三种。**单Widget仅能包含一个子Widget**。



```dart
import 'package:flutter/material.dart';

class MyHomePage extends StatelessWidget {
  const MyHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return container;
    // return padding;
    // return center;
  }
}

Container container = Container(
  padding: const EdgeInsets.all(18.0), // 内边距
  margin: const EdgeInsets.all(44.0), // 外边距
  width: 180,
  height: 240,
  alignment: Alignment.center, // 子Widget居中对齐
  decoration: BoxDecoration( //Container样式
    color: Colors.red, // 背景色
    borderRadius: BorderRadius.circular(10.0), // 圆角边框
  ),
  // child: const Text('Container（容器）在UI框架中是一个很常见的概念，Flutter也不例外。', style: TextStyle(color: Colors.black, fontSize: 20),),
  child: const Center(child: Text('Container（容器）在UI框架中是一个很常见的概念，Flutter也不例外。', style: TextStyle(color: Colors.black, fontSize: 20))), // container center组合使用
);

Padding padding = const Padding(
  padding: EdgeInsets.all(44.0),
  child: Text('Container（容器）在UI框架中是一个很常见的概念，Flutter也不例外。'),
);

Center center = const Center(child: Text("Hello"));
```



### 多子Widget布局



对于拥有多个子Widget的布局类容器而言，其布局行为无非就是两种规则的抽象：水平方向上应该如何布局、垂直方向上应该如何布局。

如同Android的LinearLayout、前端的Flex布局一样，Flutter中也有类似的概念，即将子Widget按行水平排列的Row，按列垂直排列的Column，以及负责分配这些子Widget在布局方向（行/列）中剩余空间的Expanded。



```dart
import 'package:flutter/material.dart';

class MyHomePage extends StatelessWidget {
  const MyHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    // return row;
    // return column;
    return rowFlex;
  }
}
//Row的用法示范
Row row = Row(
  children: <Widget>[
    Container(color: Colors.yellow, width: 60, height: 80,),
    Container(color: Colors.red, width: 100, height: 180,),
    Container(color: Colors.black, width: 60, height: 80,),
    Container(color: Colors.green, width: 60, height: 80,),
  ],
);

//Column的用法示范
Column column = Column(
  children: <Widget>[
    Container(color: Colors.yellow, width: 60, height: 80,),
    Container(color: Colors.red, width: 100, height: 180,),
    Container(color: Colors.black, width: 60, height: 80,),
    Container(color: Colors.green, width: 60, height: 80,),
  ],
);

// 单纯使用Row和Column控件，在子Widget的尺寸较小时，无法将容器填满，视觉样式比较难看。
// 对于这样的场景，我们可以通过Expanded控件，来制定分配规则填满容器的剩余空间。
Row rowFlex = Row(
  children: <Widget>[
    Expanded(flex: 1, child: Container(color: Colors.yellow, height: 60)), //设置了flex=1，因此宽度由Expanded来分配
    Container(color: Colors.red, width: 100, height: 180,),
    Container(color: Colors.black, width: 60, height: 80,),
    Expanded(flex: 1, child: Container(color: Colors.green,height: 60),) //设置了flex=1，因此宽度由Expanded来分配
  ],
);
```



于Row与Column而言，Flutter提供了依据坐标轴的布局对齐行为，即根据布局方向划分出主轴和纵轴：主轴，表示容器依次摆放子Widget的方向；纵轴，则是与主轴垂直的另一个方向。

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/610157c35f4457a7fffa2005ea144609.png)

我们可以根据主轴与纵轴，设置子Widget在这两个方向上的对齐规则mainAxisAlignment与crossAxisAlignment。比如，主轴方向start表示靠左对齐、center表示横向居中对齐、end表示靠右对齐、spaceEvenly表示按固定间距对齐；而纵轴方向start则表示靠上对齐、center表示纵向居中对齐、end表示靠下对齐。

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/9f3a8a9e197b350f6c0aad6f5195fc87.png)

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/d8fc6d0aa98be8a6b1867b24a833b89b.png)



对于主轴而言，Flutter默认是让父容器决定其长度，即尽可能大，类似Android中的match_parent。

在上面的例子中，Row的宽度为屏幕宽度，Column的高度为屏幕高度。主轴长度大于所有子Widget的总长度，意味着容器在主轴方向的空间比子Widget要大，这也是我们能通过主轴对齐方式设置子Widget布局效果的原因。

如果想让容器与子Widget在主轴上完全匹配，我们可以通过设置Row的mainAxisSize参数为MainAxisSize.min，由所有子Widget来决定主轴方向的容器长度，即主轴方向的长度尽可能小，类似Android中的wrap_content：

```dart
Row minRow = Row(
  mainAxisAlignment: MainAxisAlignment.spaceEvenly, //由于容器与子Widget一样宽，因此这行设置排列间距的代码并未起作用
  mainAxisSize: MainAxisSize.min, //让容器宽度与所有子Widget的宽度一致
  children: <Widget>[
    Container(color: Colors.yellow, width: 60, height: 80,),
    Container(color: Colors.red, width: 100, height: 180,),
    Container(color: Colors.black, width: 60, height: 80,),
    Container(color: Colors.green, width: 60, height: 80,),
  ],
);
```

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/d8d9cc480386bd11e60da51ddc081696.png)

### 层叠Widget布局



层叠布局容器Stack与前端中的绝对定位、Android中的Frame布局非常类似，子Widget之间允许叠加，还可以根据父容器上、下、左、右四个角的位置来确定自己的位置。**Stack提供了层叠布局的容器，而Positioned则提供了设置子Widget位置的能力**。

Stack控件允许其子Widget按照创建的先后顺序进行层叠摆放，而Positioned控件则用来控制这些子Widget的摆放位置。需要注意的是，**Positioned控件只能在Stack中使用，在其他容器中使用会报错**。



```dart
import 'package:flutter/material.dart';

class MyHomePage2 extends StatelessWidget {
  const MyHomePage2({super.key});

  @override
  Widget build(BuildContext context) {
    return stack;
  }
}

Stack stack = Stack(
  children: <Widget>[
    Container(color: Colors.yellow, width: 300, height: 300),//黄色容器
    Positioned(
      left: 18.0,
      top: 18.0,
      child: Container(color: Colors.green, width: 50, height: 50),//叠加在黄色容器之上的绿色控件
    ),
    const Positioned(
      left: 18.0,
      top:70.0,
      child: Text("Stack提供了层叠布局的容器"),//叠加在黄色容器之上的文本
    )
  ],
);
```



## 组装组件



在Flutter中，**组合的思想始终贯穿在框架设计之中**，这也是Flutter提供了如此丰富的控件库的原因之一。

**按照从上到下、从左到右去拆解UI的布局结构，把复杂的UI分解成各个小UI元素，在以组装的方式去自定义UI中非常有用**。以这样的拆解方法实现如下图所示布局：

![image-20241030170452558](https://file.40017.cn/baoxian/health/health_public/images/blog/image-20241030170452558.png)

```dart
import 'package:flutter/material.dart';

// 先定义一个数据结构CardItemModel来存储信息。
class CardItemModel {
  String appIcon;//App图标
  String appName;//App名称
  String appSize;//App大小
  String appDate;//App更新日期
  String appDescription;//App更新文案
  String appVersion;//App版本
  //构造函数语法糖，为属性赋值
  CardItemModel({
    required this.appIcon,
    required this.appName,
    required this.appSize,
    required this.appDate,
    required this.appDescription,
    required this.appVersion
});
}

class MyCardWithIcon extends StatelessWidget {
  final CardItemModel model;
  //构造函数语法糖，用来给model赋值
  const MyCardWithIcon({required Key key,required this.model, required this.onPressed}) : super(key: key);
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Column(//用Column将上下两部分合体
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          buildTopRow(context),//上半部分
          buildBottomRow(context)//下半部分
        ]);
  }

  Widget buildTopRow(BuildContext context) {
    return Row( //Row控件，用来水平摆放子Widget
        children: <Widget>[
          Padding(//Padding控件，用来设置Image控件边距
              padding: const EdgeInsets.all(10),//上下左右边距均为10
              child: ClipRRect(//圆角矩形裁剪控件
                  borderRadius: BorderRadius.circular(8.0),//圆角半径为8
                  child: Image.asset(model.appIcon, width: 80,height:80)  // 图片控件
              )
          ),
          Expanded(//Expanded控件，用来拉伸中间区域
            child: Column(//Column控件，用来垂直摆放子Widget
              mainAxisAlignment: MainAxisAlignment.center,//垂直方向居中对齐
              crossAxisAlignment: CrossAxisAlignment.start,//水平方向居左对齐
              children: <Widget>[
                Text(model.appName,maxLines: 1, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis,),//App名字
                Text(model.appDate,maxLines: 1, style: const TextStyle(color: Colors.grey), overflow: TextOverflow.ellipsis,),//App更新日期
              ],
            ),
          ),
          Padding(//Padding控件，用来设置Widget间边距
              padding: const EdgeInsets.fromLTRB(0,0,10,0),//右边距为10，其余均为0
              child: FilledButton(//按钮控件
                onPressed: onPressed,//按钮控件
                child: const Text("OPEN"),//点击回调
              )
          )
        ]);
  }

  Widget buildBottomRow(BuildContext context) {
    return Padding(//Padding控件用来设置整体边距
        padding: const EdgeInsets.fromLTRB(15,0,15,0),//左边距和右边距为15
        child: Column(//Column控件用来垂直摆放子Widget
            crossAxisAlignment: CrossAxisAlignment.start,//水平方向距左对齐
            children: <Widget>[
              Text(model.appDescription),//更新文案
              Padding(//Padding控件用来设置边距
                  padding: const EdgeInsets.fromLTRB(0,10,0,0),//上边距为10
                  child: Text("${model.appVersion} • ${model.appSize} MB")
              )
            ]
        ));
  }
}
```



## 自绘



Flutter提供了非常丰富的控件和布局方式，使得我们可以通过组合去构建一个新的视图。但对于一些不规则的视图，用SDK提供的现有Widget组合可能无法实现，比如饼图，k线图等，这个时候我们就需要自己用画笔去绘制了。

**在Flutter中，CustomPaint是用以承接自绘控件的容器，并不负责真正的绘制**。既然是绘制，那就需要用到画布与画笔。

画布是Canvas，画笔则是Paint，而画成什么样子，则由定义了绘制逻辑的CustomPainter来控制。将CustomPainter设置给容器CustomPaint的painter属性，我们就完成了一个自绘控件的封装。

对于画笔Paint，我们可以配置它的各种属性，比如颜色、样式、粗细等；而画布Canvas，则提供了各种常见的绘制方法，比如画线drawLine、画矩形drawRect、画点DrawPoint、画路径drawPath、画圆drawCircle、画圆弧drawArc等。

这样，我们就可以在CustomPainter的paint方法里，通过Canvas与Paint的配合，实现定制化的绘制逻辑。



在下面的代码中，我们继承了CustomPainter，在定义了绘制逻辑的paint方法中，通过Canvas的drawArc方法，用6种不同颜色的画笔依次画了6个1/6圆弧，拼成了一张饼图。最后，我们使用CustomPaint容器，将painter进行封装，就完成了饼图控件Cake的定义。

```dart
import 'package:flutter/material.dart';
import 'dart:math';

class WheelPainter extends CustomPainter {
  // 设置画笔颜色
  Paint getColoredPaint(Color color) {//根据颜色返回不同的画笔
    Paint paint = Paint();//生成画笔
    paint.color = color;//设置画笔颜色
    return paint;
  }

  @override
  void paint(Canvas canvas, Size size) {//绘制逻辑
    double wheelSize = min(size.width,size.height)/2;//饼图的尺寸
    double nbElem = 6;//分成6份
    double radius = (2 * pi) / nbElem;//1/6圆
    //包裹饼图这个圆形的矩形框
    Rect boundingRect = Rect.fromCircle(center: Offset(wheelSize, wheelSize), radius: wheelSize);
    // 每次画1/6个圆弧
    canvas.drawArc(boundingRect, 0, radius, true, getColoredPaint(Colors.orange));
    canvas.drawArc(boundingRect, radius, radius, true, getColoredPaint(Colors.black38));
    canvas.drawArc(boundingRect, radius * 2, radius, true, getColoredPaint(Colors.green));
    canvas.drawArc(boundingRect, radius * 3, radius, true, getColoredPaint(Colors.red));
    canvas.drawArc(boundingRect, radius * 4, radius, true, getColoredPaint(Colors.blue));
    canvas.drawArc(boundingRect, radius * 5, radius, true, getColoredPaint(Colors.pink));
  }
  // 判断是否需要重绘，这里我们简单的做下比较即可
  @override
  bool shouldRepaint(CustomPainter oldDelegate) => oldDelegate != this;
}
//将饼图包装成一个新的控件
class Cake extends StatelessWidget {
  const Cake({super.key});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: const Size(200, 200),
      painter: WheelPainter(),
    );
  }
}
```



**在实现视觉需求上，自绘需要自己亲自处理绘制逻辑，而组合则是通过子Widget的拼接来实现绘制意图。**因此从渲染逻辑处理上，自绘方案可以进行深度的渲染定制，从而实现少数通过组合很难实现的需求（比如饼图、k线图）。不过，当视觉效果需要调整时，采用自绘的方案可能需要大量修改绘制代码，而组合方案则相对简单：只要布局拆分设计合理，可以通过更换子Widget类型来轻松搞定。



## 主题定制



**视觉效果是易变的，我们将这些变化的部分抽离出来，把提供不同视觉效果的资源和配置按照主题进行归类，整合到一个统一的中间层去管理，这样我们就能实现主题的管理和切换了。**

**Flutter由ThemeData来统一管理主题的配置信息**。

ThemeData涵盖了Material Design规范的可自定义部分样式，比如应用明暗模式brightness、应用主色调primaryColor、应用次级色调accentColor、文本字体fontFamily、输入框光标颜色cursorColor等。如果你想深入了解ThemeData的其他API参数，可以参考官方文档[ThemeData](https://api.flutter.dev/flutter/material/ThemeData/ThemeData.html)。

通过ThemeData来自定义应用主题，我们可以实现App全局范围，或是Widget局部范围的样式切换。



### 全局



在Flutter中，应用程序类MaterialApp的初始化方法，为我们提供了设置主题的能力。我们可以通过参数theme，选择改变App的主题色、字体等，设置界面在MaterialApp下的展示样式。



```dart
MaterialApp(
  title: 'Flutter Demo',//标题
  theme: ThemeData(//设置主题
      brightness: Brightness.dark,//设置明暗模式为暗色
      accentColor: Colors.black,//(按钮）Widget前景色为黑色
      primaryColor: Colors.cyan,//主色调为青色
      iconTheme:IconThemeData(color: Colors.yellow),//设置icon主题色为黄色
      textTheme: TextTheme(body1: TextStyle(color: Colors.red))//设置文本颜色为红色
  ),
  home: MyHomePage(title: 'Flutter Demo Home Page'),
);
```



### 局部



在Flutter中，我们可以使用Theme来对App的主题进行局部覆盖。Theme是一个单子Widget容器，与MaterialApp类似的，我们可以通过设置其data属性，对其子Widget进行样式定制：

- 如果我们不想继承任何App全局的颜色或字体样式，可以直接新建一个ThemeData实例，依次设置对应的样式；
- 而如果我们不想在局部重写所有的样式，则可以继承App的主题，使用copyWith方法，只更新部分样式。

```dart
// 新建主题
Theme(
    data: ThemeData(iconTheme: IconThemeData(color: Colors.red)),
    child: Icon(Icons.favorite)
);

// 继承主题
Theme(
    data: Theme.of(context).copyWith(iconTheme: IconThemeData(color: Colors.green)),
    child: Icon(Icons.feedback)
);
```



**除了定义Material Design规范中那些可自定义部分样式外，主题的另一个重要用途是样式复用。**

比如，如果我们想为一段文字复用Materia Design规范中的title样式，或是为某个子Widget的背景色复用App的主题色，我们就可以通过Theme.of(context)方法，取出对应的属性，应用到这段文字的样式中。

```dart
Container(
          color: Theme.of(context).primaryColor,//容器背景色复用应用主题色
          child: Text(
            'Text with a background color',
            style: Theme.of(context).textTheme.titleLarge,//Text组件文本样式复用应用文本样式
          ))
```



### 分平台定制



有时候，**为了满足不同平台的用户需求，我们希望针对特定的平台设置不同的样式**。比如，在iOS平台上设置浅色主题，在Android平台上设置深色主题。

```dart
  // iOS浅色主题
  final ThemeData kIOSTheme = ThemeData(
      brightness: Brightness.light,//亮色主题
      hintColor: Colors.white,//(按钮)Widget前景色为白色
      primaryColor: Colors.blue,//主题色为蓝色
      iconTheme: const IconThemeData(color: Colors.grey),//icon主题为灰色
      textTheme: const TextTheme(bodyMedium: TextStyle(color: Colors.black))//文本主题为黑色
  );
  // Android深色主题
  final ThemeData kAndroidTheme = ThemeData(
      brightness: Brightness.dark,//深色主题
      hintColor: Colors.black,//(按钮)Widget前景色为黑色
      primaryColor: Colors.cyan,//主题色Wie青色
      iconTheme: const IconThemeData(color: Colors.blue),//icon主题色为蓝色
      textTheme: const TextTheme(bodyMedium: TextStyle(color: Colors.red))//文本主题色为红色
  );

  MaterialApp(
      title: 'Flutter Demo',//标题
      theme: defaultTargetPlatform == TargetPlatform.iOS ? kIOSTheme : kAndroidTheme,//根据平台选择不同主题,
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
  );
```



## 资源管理



Flutter并没有像Android那样预先定义资源的目录结构，所以我们可以把资源存放在项目中的任意目录下，只需要使用**根目录下的pubspec.yaml文件**，对这些资源的所在位置进行显式声明就可以了，以帮助Flutter识别出这些资源。

而在指定路径名的过程中，我们既可以对每一个文件进行挨个指定，也可以采用子目录批量指定的方式。



### 常规资源



假设我们将资源放入assets目录下，其中，两张图片`background.jpg`、`loading.gif`与JSON文件`result.json`在assets根目录，而另一张图片`food_icon.jpg`则在assets的子目录icons下。

```
assets
├── background.jpg
├── icons
│   └── food_icon.jpg
├── loading.gif
└── result.json
```

```yaml
flutter:
  assets:
    - assets/background.jpg   #挨个指定资源路径
    - assets/loading.gif  #挨个指定资源路径
    - assets/result.json  #挨个指定资源路径
    - assets/icons/    #子目录批量指定
    - assets/ #根目录也是可以批量指定的
```

需要注意的是，**目录批量指定并不递归，只有在该目录下的文件才可以被包括，如果下面还有子目录的话，需要单独声明子目录下的文件。**



### 像素比例



与Android、iOS开发类似，**Flutter也遵循了基于像素密度的管理方式**，如1.0x、2.0x、3.0x或其他任意倍数，Flutter可以根据当前设备分辨率加载最接近设备像素比例的图片资源。

```
assets
├── background.jpg    //1.0x图
├── 2.0x
│   └── background.jpg  //2.0x图
└── 3.0x
    └── background.jpg  //3.0x图
```

而在pubspec.yaml文件声明这个图片资源时，仅声明1.0x图资源即可：

```yaml
flutter:
  assets:
    - assets/background.jpg   #1.0x图资源
```

1.0x分辨率的图片是资源标识符，而Flutter则会根据实际屏幕像素比例加载相应分辨率的图片。这时，如果主资源缺少某个分辨率资源，Flutter会在剩余的分辨率资源中选择最接近的分辨率资源去加载。



### 字体



**字体则是另外一类较为常用的资源**。手机操作系统一般只有默认的几种字体，在大部分情况下可以满足我们的正常需求。但是，在一些特殊的情况下，我们可能需要使用自定义字体来提升视觉体验。

```yaml
fonts:
  - family: RobotoCondensed  #字体名字
    fonts:
      - asset: assets/fonts/RobotoCondensed-Regular.ttf #普通字体
      - asset: assets/fonts/RobotoCondensed-Italic.ttf 
        style: italic  #斜体
      - asset: assets/fonts/RobotoCondensed-Bold.ttf 
        weight: 700  #粗体
```

```dart
Text("This is RobotoCondensed", style: TextStyle(
    fontFamily: 'RobotoCondensed',//普通字体
));
Text("This is RobotoCondensed", style: TextStyle(
    fontFamily: 'RobotoCondensed',
    fontWeight: FontWeight.w700, //粗体
));
Text("This is RobotoCondensed italic", style: TextStyle(
  fontFamily: 'RobotoCondensed',
  fontStyle: FontStyle.italic, //斜体
));
```



### 启动图标



对于Android平台，启动图标位于根目录`android/app/src/main/res/mipmap`下。我们只需要遵守对应的像素密度标准，保留原始图标名称，将图标更换为目标资源即可：

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/image-20241104140726643.png)

对于iOS平台，启动图位于根目录`ios/Runner/Assets.xcassets/AppIcon.appiconset`下。同样地，我们只需要遵守对应的像素密度标准，将其替换为目标资源并保留原始图标名称即可：
![img](https://file.40017.cn/baoxian/health/health_public/images/blog/image-20241104140850081.png)



### 启动图



对于Android平台，启动图位于根目录`android/app/src/main/res/drawable`下，是一个名为`launch_background`的XML界面描述文件。

![image-20241104141132091](https://file.40017.cn/baoxian/health/health_public/images/blog/image-20241104141132091.png)

更换一张居中显示的启动图片：

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- 白色背景 -->
    <item android:drawable="@android:color/white" />
    <item>
         <!-- 内嵌一张居中展示的图片 -->
        <bitmap
            android:gravity="center"
            android:src="@mipmap/bitmap_launcher" />
    </item>
</layer-list>
```



而对于iOS平台，启动图位于根目录`ios/Runner/Assets.xcassets/LaunchImage.imageset`下。我们保留原始启动图名称，将图片依次按照对应像素密度标准，更换为目标启动图即可。

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/image-20241104141403226.png)



## 包管理工具



Dart提供了包管理工具Pub，用来管理代码和资源。从本质上说，包（package）实际上就是一个包含了pubspec.yaml文件的目录，其内部可以包含代码、资源、脚本、测试和文档等文件。包中包含了需要被外部依赖的功能抽象，也可以依赖其他包。

**Dart提供包管理工具Pub的真正目的是，让你能够找到真正好用的、经过线上大量验证的库，复用他人的成果来缩短开发周期，提升软件质量。**



在下面的例子中，我们声明了一个flutter_app_example的应用配置文件，其版本为1.0，Dart运行环境支持2.1至3.0之间，依赖flutter和cupertino_icon：

```yaml
name: flutter_app_example #应用名称
description: A new Flutter application. #应用描述
version: 1.0.0 
#Dart运行环境区间
environment:
  sdk: ">=2.1.0 <3.0.0"
#Flutter依赖库
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ">0.1.1" #版本约束信息 由一组空格分隔的版本描述组成，可以支持指定版本、版本号区间，以及任意版本这三种版本约束方式
```

需要注意的是，由于元数据与名称使用空格分隔，因此版本号中不能出现空格；同时又由于大于符号`>`也是YAML语法中的折叠换行符号，因此在指定版本范围的时候，必须使用引号， 比如`">=2.1.0 < 3.0.0"`。



**对于包，我们通常是指定版本区间，而很少直接指定特定版本**，因为包升级变化很频繁，如果有其他的包直接或间接依赖这个包的其他版本时，就会经常发生冲突。而**对于运行环境，如果是团队多人协作的工程，建议将Dart与Flutter的SDK环境写死，统一团队的开发环境**，避免因为跨SDK版本出现的API差异进而导致工程问题。比如，在上面的示例中，我们可以将Dart SDK写死为2.3.0，Flutter SDK写死为1.2.1。

```yaml
environment:
  sdk: 2.3.0
  flutter: 1.2.1
```



基于版本的方式引用第三方包，需要在其Pub上进行公开发布，我们可以访问https://pub.dev/来获取可用的第三方包。而对于不对外公开发布，或者目前处于开发调试阶段的包，我们需要设置数据源，使用本地路径或Git地址的方式进行包声明。在下面的例子中，我们分别以路径依赖以及Git依赖的方式，声明了package1和package2这两个包：

```yaml
dependencies:
  package1:
    path: ../package1/  #路径依赖
  date_format:
    git:
      url: https://github.com/xxx/package2.git #git依赖
```



在开发应用时，我们可以不写明具体的版本号，而是以区间的方式声明包的依赖；但对于一个程序而言，其运行时具体引用哪个版本的依赖包必须要确定下来。因此，**除了管理第三方依赖，包管理工具Pub的另一个职责是，找出一组同时满足每个包版本约束的包版本。**包版本一旦确定，接下来就是下载对应版本的包了。

对于dependencies中的不同数据源，Dart会使用不同的方式进行管理，最终会将远端的包全部下载到本地。比如，对于Git声明依赖的方式，Pub会clone Git仓库；对于版本号的方式，Pub则会从pub.dartlang.org下载包。如果包还有其他的依赖包，比如package1包还依赖package3包，Pub也会一并下载。

然后，在完成了所有依赖包的下载后，**Pub会在应用的根目录下创建.packages文件**，将依赖的包名与系统缓存中的包文件路径进行映射，方便后续维护。

最后，**Pub会自动创建pubspec.lock文件**。pubspec.lock文件的作用类似iOS的Podfile.lock或前端的package-lock.json文件，用于记录当前状态下实际安装的各个直接依赖、间接依赖的包的具体来源和版本号。

比较活跃的第三方包的升级通常比较频繁，因此对于多人协作的Flutter应用来说，我们需要把pubspec.lock文件也一并提交到代码版本管理中，这样团队中的所有人在使用这个应用时安装的所有依赖都是完全一样的，以避免出现库函数找不到或者其他的依赖错误。



**除了提供功能和代码维度的依赖之外，包还可以提供资源的依赖**。在依赖包中的pubspec.yaml文件已经声明了同样资源的情况下，为节省应用程序安装包大小，我们需要复用依赖包中的资源。在下面的例子中，我们的应用程序依赖了一个名为package4的包，而它的目录结构是这样的：

```
pubspec.yaml    
└──assets
    ├──2.0x
    │   └── placeholder.png
    └──3.0x
        └── placeholder.png
```

其中，placeholder.png是可复用资源。因此，在应用程序中，我们可以通过Image和AssetImage提供的package参数，根据设备实际分辨率去加载图像。

```dart
Image.asset('assets/placeholder.png', package: 'package4');

AssetImage('assets/placeholder.png', package: 'package4');
```



## 手势交互



手势操作在Flutter中分为两类：

- 第一类是原始的指针事件（Pointer Event），即原生开发中常见的触摸事件，表示屏幕上触摸（或鼠标、手写笔）行为触发的位移行为；
- 第二类则是手势识别（Gesture Detector），表示多个原始指针事件的组合操作，如点击、双击、长按等，是指针事件的语义化封装。



### 指针事件



指针事件表示用户交互的原始触摸数据，如手指接触屏幕PointerDownEvent、手指在屏幕上移动PointerMoveEvent、手指抬起PointerUpEvent，以及触摸取消PointerCancelEvent，这与原生系统的底层触摸事件抽象是一致的。

在手指接触屏幕，触摸事件发起时，Flutter会确定手指与屏幕发生接触的位置上究竟有哪些组件，并将触摸事件交给最内层的组件去响应。与浏览器中的事件冒泡机制类似，事件会从这个最内层的组件开始，沿着组件树向根节点向上冒泡分发。

不过Flutter无法像浏览器冒泡那样取消或者停止事件进一步分发，我们只能通过hitTestBehavior去调整组件在命中测试期内应该如何表现，比如把触摸事件交给子组件，或者交给其视图层级之下的组件去响应。

关于组件层面的原始指针事件的监听，Flutter提供了Listener Widget，可以监听其子Widget的原始指针事件。

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      home: Scaffold(
        appBar: AppBar(title: const Text("event demo")),
        body: Listener(
          child: Container(
            color: Colors.red,//背景色红色
            width: 300,
            height: 300,
          ),
          onPointerDown: (event) => print("down $event"),//手势按下回调
          onPointerMove:  (event) => print("move $event"),//手势移动回调
          onPointerUp:  (event) => print("up $event"),//手势抬起回调
        ),
      ),
    );
  }
}
```



### 手势识别



使用Listener可以直接监听指针事件。不过指针事件毕竟太原始了，如果我们想要获取更多的触摸事件细节，比如判断用户是否正在拖拽控件，直接使用指针事件的话就会非常复杂。

通常情况下，响应用户交互行为的话，我们会使用封装了手势语义操作的Gesture，如点击onTap、双击onDoubleTap、长按onLongPress、拖拽onPanUpdate、缩放onScaleUpdate等。另外，Gesture可以支持同时分发多个手势交互行为，意味着我们可以通过Gesture同时监听多个事件。

**Gesture是手势语义的抽象，而如果我们想从组件层监听手势，则需要使用GestureDetector**。GestureDetector是一个处理各种高级用户触摸行为的Widget，与Listener一样，也是一个功能性组件。



举个例子，定义了一个Stack层叠布局，使用Positioned组件将1个红色的Container放置在左上角，并同时监听点击、双击、长按和拖拽事件。在拖拽事件的回调方法中，更新Container的位置：

```dart
import 'package:flutter/material.dart';

class GesEvent extends StatefulWidget {
  const GesEvent({super.key});

  @override
  GesState createState() => GesState();
}

class GesState extends State<GesEvent> {
  //红色container坐标
  double _top = 0.0;
  double _left = 0.0;

  @override
  Widget build(BuildContext context) {
    return Stack(//使用Stack组件去叠加视图，便于直接控制视图坐标
      children: <Widget>[
        Positioned(
          top: _top,
          left: _left,
          child: GestureDetector(//手势识别
            child: Container(color: Colors.red,width: 50,height: 50),//红色子视图
            onTap: ()=>print("Tap"),//点击回调
            onDoubleTap: ()=>print("Double Tap"),//双击回调
            onLongPress: ()=>print("Long Press"),//长按回调
            onPanUpdate: (e) {//拖动回调
              setState(() {
                //更新位置
                _left += e.delta.dx;
                _top += e.delta.dy;
              });
            },
          ),
        )
      ],
    );
  }
}
```



### 手势竞技场



我们对一个Widget同时监听了多个手势事件，但最终只会有一个手势能够得到本次事件的处理权。对于多个手势的识别，Flutter引入了**手势竞技场（Arena）**的概念，用来识别究竟哪个手势可以响应用户事件。手势竞技场会考虑用户触摸屏幕的时长、位移以及拖动方向，来确定最终手势。

GestureDetector内部对每一个手势都建立了一个工厂类（Gesture Factory）。而工厂类的内部会使用手势识别类（GestureRecognizer），来确定当前处理的手势。

而所有手势的工厂类都会被交给RawGestureDetector类，以完成监测手势的大量工作：使用Listener监听原始指针事件，并在状态改变时把信息同步给所有的手势识别器，然后这些手势会在竞技场决定最后由谁来响应用户事件。

手势识别发生在多个存在父子关系的视图时，手势竞技场会一并检查父视图和子视图的手势，并且通常最终会确认由子视图来响应事件。而这也是合乎常理的：从视觉效果上看，子视图的视图层级位于父视图之上，相当于对其进行了遮挡，因此从事件处理上看，子视图自然是事件响应的第一责任人。



运行这段代码，然后在蓝色区域进行点击，可以发现：尽管父容器也监听了点击事件，但Flutter只响应了子容器的点击事件。

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      home: Scaffold(
        appBar: AppBar(title: const Text("event demo")),
        body: GestureDetector(
          onTap: () => print('Parent tapped'),//父视图的点击回调
          child: Container(
            color: Colors.pinkAccent,
            child: Center(
              child: GestureDetector(
                onTap: () => print('Child tapped'),//子视图的点击回调
                child: Container(
                  color: Colors.blueAccent,
                  width: 200.0,
                  height: 200.0,
                ),
              ),
            ),
          ),
        )
      ),
    );
  }
}
```



为了让父容器也能接收到手势，我们需要同时使用RawGestureDetector和GestureFactory，来改变竞技场决定由谁来响应用户事件的结果。

在此之前，**我们还需要自定义一个手势识别器**，让这个识别器在竞技场被PK失败时，能够再把自己重新添加回来，以便接下来还能继续去响应用户事件。

```dart
import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';

void main() => runApp(const MyApp());

// 定义了一个继承自点击手势识别器TapGestureRecognizer的类，并重写了其rejectGesture方法，手动地把事件又复活了
class MultipleTapGestureRecognizer extends TapGestureRecognizer {
  @override
  void rejectGesture(int pointer) {
    acceptGesture(pointer);
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      home: Scaffold(
        appBar: AppBar(title: const Text("event demo")),
        // 接下来，我们需要将手势识别器和其工厂类传递给RawGestureDetector，以便用户产生手势交互事件时能够立刻找到对应的识别方法。
        // 事实上，RawGestureDetector的初始化函数所做的配置工作，就是定义不同手势识别器和其工厂类的映射关系。
        // 工厂类的初始化采用GestureRecognizerFactoryWithHandlers函数完成，这个函数提供了手势识别对象创建，以及对应的初始化入口。
        body: RawGestureDetector(//自己构造父Widget的手势识别映射关系
          gestures: {
            //建立多手势识别器与手势识别工厂类的映射关系，从而返回可以响应该手势的recognizer
            MultipleTapGestureRecognizer: GestureRecognizerFactoryWithHandlers<
                MultipleTapGestureRecognizer>(
                  () => MultipleTapGestureRecognizer(),
                  (MultipleTapGestureRecognizer instance) {
                instance.onTap = () => print('parent tapped ');//点击回调
              },
            )
          },
          child: Container(
            color: Colors.pinkAccent,
            child: Center(
              child: GestureDetector(//子视图可以继续使用GestureDetector
                onTap: () => print('Child tapped'),
                child: Container(
                  color: Colors.pinkAccent,
                  child: const Center(
                      child: Text('子视图')
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```



## 跨组件传值



总结为以下几种方式：

![b2a78dbefdf30895504b2017355ae066](https://file.40017.cn/baoxian/health/health_public/images/blog/b2a78dbefdf30895504b2017355ae066.png)



### InheritedWidget



InheritedWidget是Flutter中的一个功能型Widget，适用于在Widget树中共享数据的场景。通过它，我们可以高效地将数据在Widget树中进行跨层传递。

接下来，以Flutter工程模板中的计数器为例，说明InheritedWidget的使用方法。

- 首先，为了使用InheritedWidget，定义了一个继承自它的新类CountContainer。
- 然后，将计数器状态count属性放到CountContainer中，并提供了一个of方法方便其子Widget在Widget树中找到它。
- 最后，重写了updateShouldNotify方法，这个方法会在Flutter判断InheritedWidget是否需要重建，从而通知下层观察者组件更新数据时被调用到。在这里，直接判断count是否相等即可。

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'Flutter Demo Home Page'),
    );
  }
}

// InheritedWidget仅提供了数据读的能力，如果我们想要修改它的数据，则需要把它和StatefulWidget中的State配套使用。
class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => MyHomePageState();
}

class CountContainer extends InheritedWidget {
  //方便其子Widget在Widget树中找到它
  static CountContainer of(BuildContext context) => context.dependOnInheritedWidgetOfExactType<CountContainer>() as CountContainer;

  final MyHomePageState model;//直接使用MyHomePage中的State获取数据
  final Function() increment;
  final int count;

  const CountContainer({
    required Key super.key,
    required this.count,
    required this.model,
    required this.increment,
    required super.child,
  });

  // 判断是否需要更新
  @override
  bool updateShouldNotify(CountContainer oldWidget) => count != oldWidget.count;
}

class MyHomePageState extends State<MyHomePage> {
  int count = 0;
  void _incrementCounter() => setState(() {count++;});//修改计数器

  @override
  Widget build(BuildContext context) {
    //将CountContainer作为根节点，并使用0作为初始化count
    return CountContainer(
        model: this,//将自身作为model交给CountContainer
        increment: _incrementCounter,//提供修改数据的方法
        key: const Key('1'),
        count: count,
        child: const Counter()
    );
  }
}

class Counter extends StatelessWidget {
  const Counter({super.key});

  @override
  Widget build(BuildContext context) {
    //获取InheritedWidget节点
    CountContainer state = CountContainer.of(context);
    return Scaffold(
      appBar: AppBar(title: const Text("InheritedWidget demo")),
      body: Text(
        'You have pushed the button this many times: ${state.count}',
      ),
      floatingActionButton: FloatingActionButton(onPressed: state.increment),
    );
  }
}
```



### Notification



Notification是Flutter中进行跨层数据共享的另一个重要的机制。如果说InheritedWidget的数据流动方式是从父Widget到子Widget逐层传递，那Notificaiton则恰恰相反，数据流动方式是从子Widget向上传递至父Widget。这样的数据传递机制适用于子Widget状态变更，发送通知上报的场景。

如果想要实现自定义通知，我们首先需要继承Notification类。Notification类提供了dispatch方法，可以让我们沿着context对应的Element节点树向上逐层发送通知。

```dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: Scaffold(
        appBar: AppBar(title: const Text("Flutter Demo Home Page")),
        body: const MyHomePage(),
      ),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => MyHomePageState();
}

class CustomNotification extends Notification {
  CustomNotification(this.msg);
  final String msg;
}

//抽离出一个子Widget用来发通知
class CustomChild extends StatelessWidget {
  const CustomChild({super.key});

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      //按钮点击时分发通知
      onPressed: () => CustomNotification("Hi").dispatch(context),
      child: const Text("Fire Notification"),
    );
  }
}

// 在子Widget的父Widget中，我们监听了这个通知，一旦收到通知，就会触发界面刷新，展示收到的通知信息
class MyHomePageState extends State<MyHomePage> {
  String _msg = "通知：";
  @override
  Widget build(BuildContext context) {
    //监听通知
    return NotificationListener<CustomNotification>(
        onNotification: (notification) {
          setState(() {_msg += "${notification.msg}  ";});//收到子Widget通知，更新msg
          return true;
        },
        child:Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[Center(child: Text(_msg),),const Center(child: CustomChild(),)],//将子Widget加入到视图树中
        )
    );
  }
}
```



### EventBus



无论是InheritedWidget还是Notificaiton，它们的使用场景都需要依靠Widget树，也就意味着只能在有父子关系的Widget之间进行数据共享。但是，组件间数据传递还有一种常见场景：这些组件间不存在父子关系。这时，事件总线EventBus就登场了。

需要注意的是，EventBus是一个第三方插件，因此我们需要安装它：

```bash
flutter pub add event_bus
```

```dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:event_bus/event_bus.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const FirstPage(key: Key('1'),),
    );
  }
}

// EventBus的使用方式灵活，可以支持任意对象的传递。
// 所以在这里，我们传输数据的载体就选择了一个有字符串属性的自定义事件类CustomEvent：
class CustomEvent {
  String msg;
  CustomEvent(this.msg);
}

// 定义了一个全局的eventBus对象
EventBus eventBus = new EventBus();

class FirstPage extends StatefulWidget {
  const FirstPage({required Key key}) : super(key: key);

  @override
  FirstState createState() => FirstState();
}

//第一个页面
class FirstState extends  State<FirstPage>  {

  String msg = "通知：";
  late StreamSubscription subscription;

  @override
  initState() {

    // 第一个页面监听了CustomEvent事件，一旦收到事件，就会刷新UI
    subscription = eventBus.on<CustomEvent>().listen((event) {
      setState(() {msg+= event.msg;});//更新msg
    });
    super.initState();
  }
  @override
  dispose() {
    // 需要注意的是，千万别忘了在State被销毁时清理掉事件注册，否则你会发现State永远被EventBus持有着，无法释放，从而造成内存泄漏
    subscription.cancel();//State销毁时，清理注册
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body:Column(children: [Text(msg), FilledButton(onPressed: ()=> Navigator.push(context, MaterialPageRoute(builder: (context) => const SecondPage())), child: const Text('second page'))],),
    );
  }
}

class SecondPage extends StatelessWidget {
  const SecondPage({super.key});

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      // 以按钮点击回调的方式，触发了CustomEvent事件
      onPressed: ()=> eventBus.fire(CustomEvent("hello")), child: const Text('Send hello'),
    );
  }
}
```



## 路由与导航



在Flutter中，页面之间的跳转是通过Route和Navigator来管理的：

- Route是页面的抽象，主要负责创建对应的界面，接收参数，响应Navigator打开和关闭；
- 而Navigator则会维护一个路由栈管理Route，Route打开即入栈，Route关闭即出栈，还可以直接替换栈内的某一个Route。

而根据是否需要提前注册页面标识符，Flutter中的路由管理可以分为两种方式：

- 基本路由。无需提前注册，在页面切换时需要自己构造页面实例。
- 命名路由。需要提前注册页面标识符，在页面切换时通过标识符直接打开新的路由。



### 基本路由



在Flutter中，要导航到一个新的页面，我们需要创建一个MaterialPageRoute的实例，调用`Navigator.push`方法将新页面压到堆栈的顶部。

其中，MaterialPageRoute是一种路由模板，定义了路由创建及切换过渡动画的相关配置，可以针对不同平台，实现与平台页面切换动画风格一致的路由切换动画。

而如果我们想返回上一个页面，则需要调用`Navigator.pop`方法从堆栈中删除这个页面。



### 命名路由



基本路由使用方式相对简单灵活，适用于应用中页面不多的场景。而在应用中页面比较多的情况下，再使用基本路由方式，那么每次跳转到一个新的页面，我们都要手动创建MaterialPageRoute实例，初始化页面，然后调用push方法打开它，还是比较麻烦的。

所以，Flutter提供了另外一种方式来简化路由管理，即命名路由。我们给页面起一个名字，然后就可以直接通过页面名字打开它了。要想通过名字来指定页面切换，我们必须先给应用程序MaterialApp提供一个页面名称映射规则，即路由表routes，这样Flutter才知道名字与页面Widget的对应关系。

在注册路由表时，Flutter还提供了UnknownRoute属性，我们可以对未知的路由标识符进行统一的页面跳转处理。



### 页面参数



与基本路由能够精确地控制目标页面初始化方式不同，命名路由只能通过字符串名字来初始化固定目标页面。为了解决不同场景下目标页面的初始化需求，Flutter提供了路由参数的机制，可以在打开路由时传递相关参数，在目标页面通过RouteSettings来获取页面参数。

除了页面打开时需要传递参数，对于特定的页面，在其关闭时，也需要传递参数告知页面处理结果。



### 路由与导航Demo



```dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      //注册路由
      routes:{
        "third_page":(context)=>const ThirdPage(),
      },
      //错误路由处理，统一返回UnknownPage
      onUnknownRoute: (RouteSettings setting) => MaterialPageRoute(builder: (context) => const UnknownPage()),
      home: Scaffold(
        appBar: AppBar(title: const Text("Flutter Demo Home Page")),
        body: const FirstScreen(),
      ),
    );
  }
}

class FirstScreen extends StatefulWidget {
  const FirstScreen({super.key});

  @override
  State<FirstScreen> createState() => FirstStage();
}

class FirstStage extends State<FirstScreen> {
  String _msg='';
  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Center(child: Text('Message from Second screen: $_msg')),
      Row(children: [
        FilledButton(
          // 基本路由
          onPressed: ()=> Navigator.push(context, MaterialPageRoute(builder: (context) => const SecondPage())), child: const Text('SecondPage'),
        ),
        FilledButton(
          // 命名路由 路由参数
          onPressed: ()=> Navigator.pushNamed(context, 'third_page', arguments: "Hey").then((msg)=>setState(()=>_msg=msg as String)), child: const Text('ThirdPage'),
        ),
        FilledButton(
          // 未知路由
          onPressed: ()=> Navigator.pushNamed(context, 'xxxx'), child: const Text('UnknownPage'),
        )
      ])
    ]);
  }
}

class SecondPage extends StatelessWidget {
  const SecondPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Second Page")),
      body: FilledButton(
        // 回退页面
        onPressed: ()=> Navigator.pop(context), child: const Text('Back'),
      ),
    );
  }
}

class ThirdPage extends StatelessWidget {
  const ThirdPage({super.key});

  @override
  Widget build(BuildContext context) {
    //取出路由参数
    String msg = ModalRoute.of(context)?.settings.arguments as String;
    return Scaffold(
      appBar: AppBar(title: const Text("Third Page")),
      body: Column(children: [
        Text(msg),
        FilledButton(
           // 回退参数
          onPressed: ()=> Navigator.of(context).pop('Hi'), child: const Text('Back'),
        )
      ],),
    );
  }
}

class UnknownPage extends StatelessWidget {
  const UnknownPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Unknown Page")),
      body: FilledButton(
        onPressed: ()=> Navigator.pop(context), child: const Text('Back'),
      ),
    );
  }
}
```



## 动画



### 页面内动画



对动画系统而言，为了实现动画，它需要做三件事儿：

1. 确定画面变化的规律；
2. 根据这个规律，设定动画周期，启动动画；
3. 定期获取当前动画的值，不断地微调、重绘画面。

这三件事情对应到Flutter中，就是Animation、AnimationController与Listener：

1. Animation是Flutter动画库中的核心类，会根据预定规则，在单位时间内持续输出动画的当前状态。Animation知道当前动画的状态（比如，动画是否开始、停止、前进或者后退，以及动画的当前值），但却不知道这些状态究竟应用在哪个组件对象上。换句话说，Animation仅仅是用来提供动画数据，而不负责动画的渲染。
2. AnimationController用于管理Animation，可以用来设置动画的时长、启动动画、暂停动画、反转动画等。
3. Listener是Animation的回调函数，用来监听动画的进度变化，我们需要在这个回调函数中，根据动画的当前值重新渲染组件，实现动画的渲染。



下面是一个心跳动画的logo图的实现代码：

```dart
import 'package:flutter/material.dart';

class AnimateApp extends StatefulWidget {
  const AnimateApp({super.key});
  @override
  State<AnimateApp> createState() => _AnimateAppState();
}

class _AnimateAppState extends State<AnimateApp> with SingleTickerProviderStateMixin {
  late AnimationController controller;
  late Animation<double> animation;
  @override
  void initState() {
    super.initState();
    //创建动画周期为1秒的AnimationController对象
    controller = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1000));
    //创建一条震荡曲线
    final CurvedAnimation curve = CurvedAnimation(
        parent: controller, curve: Curves.elasticOut);
    // 创建从50到200线性变化的Animation对象
    animation = Tween(begin: 50.0, end: 200.0).animate(curve)
      ..addListener(() {
        setState(() {}); //刷新界面
      });
    // 循环执行动画
    animation.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        controller.reverse();//动画结束时反向执行
      } else if (status == AnimationStatus.dismissed) {
        controller.forward();//动画反向执行完毕时，重新执行
      }
    });
    controller.forward(); //启动动画
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        home: Center(
            child: SizedBox(
                width: animation.value, // 将动画的值赋给widget的宽高
                height: animation.value,
                child: const FlutterLogo()
            )));
  }

  @override
  void dispose() {
    controller.dispose(); // 释放资源
    super.dispose();
  }
}
```



在为Widget添加动画效果的过程中我们不难发现，Animation仅提供动画的数据，因此我们还需要监听动画执行进度，并在回调中使用setState强制刷新界面才能看到动画效果。考虑到这些步骤都是固定的，Flutter提供了两个类来帮我们简化这一步骤，即AnimatedWidget与AnimatedBuilder。

在构建Widget时，AnimatedWidget会将Animation的状态与其子Widget的视觉样式绑定。要使用AnimatedWidget，我们需要一个继承自它的新类，并接收Animation对象作为其初始化参数。然后，在build方法中，读取出Animation对象的当前值，用作初始化Widget的样式。

```dart
...
class _AnimateAppState extends State<AnimateApp> with SingleTickerProviderStateMixin {
  ...
  @override
  void initState() {
    ...
    animation = Tween(begin: 50.0, end: 200.0).animate(curve);
      // ..addListener(() {
      //   setState(() {}); //刷新界面
      // });
    // 如果使用AnimatedWidget就可以省去上面的代码
		...
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedLogo(key: const Key('1'), animation: animation,);
  }
	...
}

class AnimatedLogo extends AnimatedWidget {
  //AnimatedWidget需要在初始化时传入animation对象
  const AnimatedLogo({required Key key, required Animation<double> animation})
      : super(key: key, listenable: animation);

  @override
  Widget build(BuildContext context) {
    //取出动画对象
    final Animation<double> animation = listenable as Animation<double>;
    return Center(
        child: SizedBox(
          height: animation.value,//根据动画对象的当前状态更新宽高
          width: animation.value,
          child: const FlutterLogo(),
        ));
  }
}

```



针对简单动画可以使用上面的方式实现，如果动画的组件比较复杂，一个更好的解决方案是，**将动画和渲染职责分离**。

与AnimatedWidget类似，AnimatedBuilder也会自动监听Animation对象的变化，并根据需要将该控件树标记为dirty以自动刷新UI。事实上，如果你翻看[源码](https://github.com/flutter/flutter/blob/ca5411e3aa99d571ddd80b75b814718c4a94c839/packages/flutter/lib/src/widgets/transitions.dart#L920)，就会发现AnimatedBuilder其实也是继承自AnimatedWidget。

```dart
...
class _AnimateAppState extends State<AnimateApp> with SingleTickerProviderStateMixin {
  ...
  @override
  Widget build(BuildContext context) {
    return Center(
      child: AnimatedBuilder(
          animation: animation,//传入动画对象
          child: const FlutterLogo(),
          //动画构建回调
          builder: (context, child) => SizedBox(
            width: animation.value,//使用动画的当前状态更新UI
            height: animation.value,
            child: child, //child参数即FlutterLogo()
          )
      ),
    );
  }
	...
}
```

可以看到，通过使用AnimatedWidget和AnimatedBuilder，动画的生成和最终的渲染被分离开了，构建动画的工作也被大大简化了。



### 跨页面动画



跨页面共享的控件动画效果有一个专门的名词，即“共享元素变换”（Shared Element Transition）。Flutter也有类似的概念，即Hero控件。**通过Hero，我们可以在两个页面的共享元素之间，做出流畅的页面切换效果。**

```dart
import 'package:flutter/material.dart';

class Page1 extends StatelessWidget {
  const Page1({super.key});

  @override
  Widget build(BuildContext context) {
    return  Scaffold(
        body: GestureDetector(//手势监听点击
          child: const Hero(
              tag: 'hero',//设置共享tag
              child: SizedBox(
                  width: 100, height: 100,
                  child: FlutterLogo()
              )
          ),
          onTap: () {
            Navigator.of(context).push(MaterialPageRoute(builder: (_)=>const Page2()));//点击后打开第二个页面
          },
        )
    );
  }
}

class Page2 extends StatelessWidget {
  const Page2({super.key});

  @override
  Widget build(BuildContext context) {
    return  Scaffold(
        appBar: AppBar(title: const Text("Page2")),
        body: const Hero(
          tag: 'hero',//设置共享tag
          child: Center(
              child: SizedBox(
                  width: 300, height: 300,
                  child: FlutterLogo()
              )),
        )
    );
  }
}
```



## 事件循环与异步



**Dart是单线程的，但是单线程和异步并不冲突。**等待这个行为是通过Event Loop驱动的。事件队列Event Queue会把其他平行世界（比如Socket）完成的，需要主线程响应的事件放入其中。像其他语言一样，Dart也有一个巨大的事件循环，在不断的轮询事件队列，取出事件（比如，键盘事件、I\O事件、网络事件等），在主线程同步执行其回调函数。

在Dart中，实际上有两个队列，一个事件队列（Event Queue），另一个则是微任务队列（Microtask Queue）。在每一次事件循环中，Dart总是先去第一个微任务队列中查询是否有可执行的任务，如果没有，才会处理后续的事件队列的流程。

![img](https://file.40017.cn/baoxian/health/health_public/images/blog/70dc4e1c222ddfaee8aa06df85c22bbc.png)



**Dart为Event Queue的任务建立提供了一层封装，叫作Future**。从名字上也很容易理解，它表示一个在未来时间才会完成的任务。

把一个函数体放入Future，就完成了从同步任务到异步任务的包装。Future还提供了链式调用的能力，可以在异步任务执行完毕后依次执行链路上的其他函数体。



微任务是由scheduleMicroTask建立的。如下所示，这段代码会在下一个事件循环中输出一段字符串：

```dart
scheduleMicrotask(() => print('This is a microtask'));
```

不过，一般的异步任务通常也很少必须要在事件队列前完成，所以也不需要太高的优先级，因此我们通常很少会直接用到微任务队列，就连Flutter内部，也只有7处用到了而已（比如，手势识别、文本输入、滚动视图、保存页面效果等需要高优执行任务的场景）。



**Dart为Event Queue的任务建立提供了一层封装，叫作Future**。从名字上也很容易理解，它表示一个在未来时间才会完成的任务。

把一个函数体放入Future，就完成了从同步任务到异步任务的包装。Future还提供了链式调用的能力，可以在异步任务执行完毕后依次执行链路上的其他函数体。

```dart
// 由于f1比f2先声明，因此会被先加入事件队列，所以f1比f2先执行；
Future(() => print('f1'));
Future(() => print('f2'));

// 由于Future函数体与then共用一个事件循环，因此f3执行后会立刻同步执行then 3；
Future(() => print('f3')).then((_) => print('then 3'));

// Future函数体是null，这意味着它不需要也没有事件循环，因此后续的then也无法与它共享。在这种场景下，Dart会把后续的then放入微任务队列，在下一次事件循环中执行。
Future(() => null).then((_) => print('then 4'));
```



看个综合的例子：

```dart
import 'dart:async';

void main() {
  Future(() => print('f1'));//声明一个匿名Future
  Future fx = Future(() =>  null);//声明Future fx，其执行体为null

  //声明一个匿名Future，并注册了两个then。在第一个then回调里启动了一个微任务
  Future(() => print('f2')).then((_) {
    print('f3');
    scheduleMicrotask(() => print('f4'));
  }).then((_) => print('f5'));

  //声明了一个匿名Future，并注册了两个then。第一个then是一个Future
  Future(() => print('f6'))
      .then((_) => Future(() => print('f7')))
      .then((_) => print('f8'));

  //声明了一个匿名Future
  Future(() => print('f9'));

  //往执行体为null的fx注册了了一个then
  fx.then((_) => print('f10'));

  //启动一个微任务
  scheduleMicrotask(() => print('f11'));
  print('f12');
}
// f12 f11 f1 f10 f2 f3 f5 f4 f6 f9 f7 f8
```

- 因为其他语句都是异步任务，所以先打印`f12`。
- 剩下的异步任务中，微任务队列优先级最高，因此随后打印`f11`；然后按照Future声明的先后顺序，打印`f1`。
- 随后到了fx，由于fx的执行体是null，相当于执行完毕了，Dart将fx的then放入微任务队列，由于微任务队列的优先级最高，因此fx的then还是会最先执行，打印`f10`。
- 然后到了fx下面的f2，打印`f2`，然后执行then，打印`f3`。f4是一个微任务，要到下一个事件循环才执行，因此后续的then继续同步执行，打印`f5`。本次事件循环结束，下一个事件循环取出f4这个微任务，打印`f4`。
- 然后到了f2下面的f6，打印`f6`，然后执行then。这里需要注意的是，这个then是一个Future异步任务，因此这个then，以及后续的then都被放入到事件队列中了。
- f6下面还有f9，打印`f9`。
- 最后一个事件循环，打印`f7`，以及后续的`f8`。



总结一点，**then会在Future函数体执行完毕后立刻执行，无论是共用同一个事件循环还是进入下一个微任务。**



### 异步函数



对于一个异步函数来说，其返回时内部执行动作并未结束，因此需要返回一个Future对象，供调用者使用。调用者根据Future对象，来决定：是在这个Future对象上注册一个then，等Future的执行体结束了以后再进行异步处理；还是一直同步等待Future执行体结束。

对于异步函数返回的Future对象，如果调用者决定同步等待，则需要在调用处使用await关键字，并且在调用处的函数体使用async关键字。

**Dart中的await并不是阻塞等待，而是异步等待**。Dart会将调用体的函数也视作异步函数，将等待语句的上下文放入Event Queue中，一旦有了结果，Event Loop就会把它从Event Queue中取出，等待代码继续执行。

```dart
//声明了一个延迟2秒返回Hello的Future，并注册了一个then返回拼接后的Hello 2024
Future<String> fetchContent() => 
  Future<String>.delayed(Duration(seconds:2), () => "Hello")
    .then((x) => "$x 2024");
//异步函数会同步等待Hello 2024的返回，并打印
func() async => print(await fetchContent());

main() {
  print("func before");
  func();
  print("func after");
}

// func before  func after  Hello 2024
```

await与async只对调用上下文的函数有效，并不向上传递。因此对于这个案例而言，func是在异步等待。如果我们想在main函数中也同步等待，需要在调用异步函数时也加上await，在main函数也加上async。
