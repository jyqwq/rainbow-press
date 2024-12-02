---
title: Java学习笔记
tags:
  - 笔记
  - 学习
  - Java
createTime: 2021/10/11
permalink: /article/ly6vjqp2/
---
# Java入门

## Java特性和优势

- 简单性
- 面向对象
- 可移植性
- 高性能
- 分布式
- 动态性
- 多线程
- 安全性
- 健壮性

## Java三大版本

- JavaSE：标准版（桌面程序，控制台开发……）
- JavaME：嵌入式开发（手机，小家电……）
- JavaEE：企业级开发（web端，服务器开发……）

## JDK、JRE、JVM

- JDK：Java Development Kit / 开发者工具包->配置环境变量
- JRE：Java Runtime Environment / 运行环境->运行java程序
- JVM：JAVA Virtual Machine / Java虚拟机

## Hello World

### 编写步骤

1. 新建一个java文件（文件后缀名.java）

2. 编写代码

   ```java
   public class Hello {
       public static void main(String[] args) {
           System.out.print("hello world!");
       }
   }
   ```

3. 编译`javac hello.java`，会生成一个class文件

4. 运行class文件，`java hello`

### 可能会遇到的问题

1. 每个单词的大小写不能出现问题，**Java是大小写敏感的**
2. 尽量使用英文
3. 文件名和类名必须保持一致，并且首字母大写
4. 符号使用英文的

## Java程序运行机制

### 编译型

compile，完全编译。

操作系统、C、C++……

### 解释型

一点一点编译。

JavaScript、python……



**Java既有编译型特征也有解释型特征**

# Java基础语法

## 注释、标识符、关键字

#### 注释

java中的注释有三种：

- 单行注释 //
- 多行注释 /**/
- 文档注释 /**开头 */结尾

#### 标识符

Java所有的组成部分都需要名字。类名、变量名记忆方法名都被称为标识符

**标识符注意点**

- 所有的标识符都应该以字母（A-Z，a-z）、美元符（$）、或者下划线（_）开始
- 首字母之后可以是字母、美元符、下划线或者任何字符组合
- 不能使用关键字作为变量名或方法名
- 标识符是大小写敏感的
- 可以使用中文命名，但是一般不建议这样去使用，也不建议用拼音

#### 关键字

pubilc、class、static、void……

### 数据类型

**强类型语言**

要求变量的使用要严格符合规定，所以所有变量都必须先定义后才能使用

**弱类型语言**

JavaScript

**Java的数据类型分为两大类**

- 基本类型（数值类型：整数、浮点、字符，boolean类型：占一位其值只有true和false两个）

  ```java
  //八大基本数据类型
  //整数
  int num1 = 10; //最常用 4个字节
  byte num2 = 20; //1个字节
  short num3 = 30; //2个字节
  long num4 = 40L; //Long类型要在数字后面加一个L 8个字节
  //小数：浮点数
  float num5 = 50.1F; //float类型要在数字后面加个F 4个字节
  double num6 = 3.14159263256236; //8个字节
  //字符
  char name = "吉"; //只能一个字符 2个字节
  //字符串，String不是关键字，它是一个类
  //布尔值 1位
  boolean flag1 = true;
  boolean flag2 = false;
  
  //======================================
  
  //整数拓展 进制 二进制0b 八进制0 十进制 十六进制0x
  int i1 = 0b10; //二进制
  int i2 = 010; //八进制
  int i3 = 10; //十进制
  int i4 = 0x10; //十六进制
  
  //浮点数拓展 银行业务的表示？
  //float double
  float f = 0.1f; //0.1
  double d = 1.0/10; //0.1
  f==d; //false
  float d1 = 31231312312f;
  float d2 = d1 + 1;
  d1==d2; //true
  //最好完全使用浮点数进行比较
  
  //字符拓展
  char i1 = 'a';
  char i2 = '吉';
  System.out.print(i1); //a
  System.out.print((int)i1); //97
  System.out.print(i2); //吉
  System.out.print((int)i2); //21513
  //所有字符本质还是数字
  //编码 Unicode
  char i3 = '\u0061';
  System.out.print(i3); //a
  
  //转义字符
  //\t 制表符
  //\n 换行符
  //……
  System.out.print("Hello\tWorld");//Hello	World
  
  String s1 = new String("hello");
  String s2 = new String("hello");
  String s3 = "hello";
  String s4 = "hello";
  System.out.print(s1==s2); //false 对象 从内存分析
  System.out.print(s3==s4); //true
  ```

- 引用类型（类、接口、数组）

### 类型转换

由于java是强类型语言，所以要进行有些运算的时候，需要用到类型转换。

运算中，不同类型的数据先转换为同一类型，然后进行运算。

- 强制类型转换
- 自动类型转换

```java
int i = 128;
byte b = (byte)i; //内存溢出 byte最大值127
double c = i;

System.out.println(b); //-128

//强制转换 (类型)变量名 高->低
//自动转换 低->高

(int)23.3; //23
(int)-45.23; //-45

char c = 'a';
int d = c + 1; //98
(char)d; //b
```

**注意点**

1. 不能对布尔值进行转换
2. 不能把对象类型转换为不相干的类型
3. 在把高容量转换到低容量的时候，强制转换
4. 强转换的时候可能存在内存溢出，或者精度问题



操作比较大的数的时候，注意溢出问题

JDK新特性，数字之间可以用下划线分割

```java
int money = 10_0000_0000;

int year = 20;
int total1 = money * year; //-1474…… 计算的时候溢出了
long total2 = money * year; //默认是int，转换之前就已经溢出了

long total3 = money * ((long)year); //先把一个数转换成long
```

### 变量

- Java是一种强类型语言，每个变量都必须声明类型。

- Java变量是程序中最基本的存储单元，其要素包括变量名，变量类型和作用域。

  `type varName [=value] [{,varName [=value]}];`

  数据类型 变量名 = 值；可以使用逗号隔开来声明多个同类型变量。

注意事项

- 每个变量都有类型，类型可以是基本类型，也可以是引用类型。
- 变量名必须是合法的标识符。
- 变量声明是一条完整的语句，因此每一个声明都必须以分号结尾。

**变量作用域**

- 类变量
- 实例变量
- 局部变量

```java
public class Variable{
  static int allClick=0; // 类变量 Variable.allClick可以访问
  String str="hello world"; // 实例变量 类中所有方法可以访问
  
  public void method(){
    int i=0; //局部变量 必须声明和初始化值 方法执行结束变量从内存中释放
  }
}
```

### 常量

常量（Constant）：初始化后不能再改变值！不会变动的值。

所谓常量可以理解成一种特殊的变量，它的值被设定后，在程序运行过程中不允许被改变。

```java
//final 常量名=值
final double PI = 3.14;
```

常量名一般使用大写字符。

### 变量命名的规范

- 所有变量、方法、类名：见名知意
- 类成员变量：首字母小写和驼峰原则：monthSalary
- 局部变量：首字母小写和驼峰原则
- 常量：大写字母和下划线：MAX_VALUE
- 类名：首字母大写和驼峰原则
- 方法名：首字母小写和驼峰原则：run(),runRun()

### 运算符

Java语言支持如下运算符：

- 算数运算符：+,-,*,/,%,++,--
- 赋值运算符：=
- 关系运算符：>,<,>=,<=,==,!=,instanceof
- 逻辑运算符：&&,||,!
- 位运算符：&,|,^,~,>>,<<,>>>
- 条件运算符：? :
- 扩展赋值运算符：+=,-=,*=,/=

```java
int a=3;
int b=a++; //执行完这行代码后，先给b赋值，再自增 b=3 a=4
int c=++a; //执行完这行代码后，先自增，再给c赋值 a=5 c=5
```

### 包机制

为了更好地组织类，java提供了包机制，用于区别类名的命名空间。

包的本质就是一个文件夹。

包语句的语法格式为：

```java
package pkg1[. pkg2[. pkg3]]
```

一般利用公司域名倒置作为包名。

为了能够使用某一个包的成员，我们需要在java程序中明确导入该包。使用import语句可以完成此功能。

```java
import package1[.package2].(classname|*)
```

### JavaDoc

javadoc命令是用来生成自己的API文档的。

**参数信息**

- @author 作者名
- @version 版本号
- @since 指明需要最早使用的jdk版本
- @param 参数名
- @return 返回值的情况
- @throws 异常抛出情况

在命令行中：

```java
javadoc -encoding UTF-8 -charset UTF-8 Doc.java
```

在IDEA中运行：

Tools->Generate JavaDoc

# Java流程控制

## 用户交互Scanner

### Scanner对象

Java.util.Scanner是Java5的新特征，我们可以通过Scanner类来获取用户的输入。

基本语法：

```java
Scanner s = new Scanner(System.in);
```

通过Scanner类的next()与nextLine()方法获取输入的字符串，在读取前我们一般需要使用hasNext()与hasNextLine()判断是否还有输入的数据。

```java
public class Demo01 {
    public static void main(String[] args) {
        
        //创建一个扫描器类型
        Scanner s = new Scanner(System.in);

        System.out.println("使用next方式接收：");
        
        //判断用户有没有输入字符串
        if (s.hasNext()){
            //使用next方式接收
            String str = s.next(); //程序会等待用户输入完毕
            System.out.println("输出的内容为："+str);
        }
        
        //凡是属于IO流的类如果不关闭会一直占用资源，要养成习惯用完就关掉
        s.close();
    }
}
```

```java
public class Demo02 {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("使用nextLine方式接收：");
        
        if (scanner.hasNextLine()){
            String str = scanner.nextLine();
            System.out.println("输出的内容为："+str);
        }
        scanner.close();
    }
}
```

- next()
  1. 一定要读取到有效字符后才可以结束输入。
  2. 对输入有效字符之前遇到的空白，next()方法会自动将其去掉。
  3. 只有输入有效字符后才将其后面输入的空白作为分隔符或者结束符。
  4. next()不能得到带有空格的字符串。
- nextLine()
  1. 以Enter为结束符，也就是说nextLine()方法返回的是输入回车之前的所有字符。
  2. 可以获得空白。

```java
public class Demo03 {
    public static void main(String[] args) {
        //我们可以输入多个数字，并求其和与平均数，每输入一个数字用回车确认，通过输入非数字来结束输入并输出执行结果：
        Scanner scanner = new Scanner(System.in);
        
        //和
        double sum = 0;
        //输入多少数字
        int m = 0;
        //通过循环判断是否还有输入，并在里面对每一次进行求和和统计
        while (scanner.hasNextDouble()){
            double x = scanner.nextDouble();
            m++;
            sum = sum + x;
        }
        System.out.println(m+"个数的和为"+sum);
        System.out.println(m+"个数的平均值为"+(sum/m));
        
        scanner.close();
    }
}
```

## 顺序结构

- JAVA的基本结构就是顺序结构，除非特别指明，否则就按照顺序一句一句执行。

- 顺序结构是最简单的算法结构。

- 语句与语句之间，框与框之间是按照从上到下的顺序进行的，它是由若干个依次执行的处理步骤组成的，它是任何一个算法都离不开的一种基本算法结构。

## 选择结构

- if单选择结构
- if双选择结构
- if多选择结构
- 嵌套的if结构
- switch多选结构

```java
public class Demo04 {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("请输入：");
        String s = scanner.nextLine();
      	//equals判断字符串是否相等
        if (s.equals("Hello")){
            System.out.println(s);
        }else if (s.equals("World")){
            System.out.println("World");
        }else{
            if(s.equals("666")){
              System.out.println("999");
            }
            System.out.println("Error");
        }
        System.out.println("End");
        scanner.close();
    }
}
```

- switch case语句判断一个变量与一系列值中某个值是否相等，每个值称为一个分支。
- switch语句中的变量类型可以是：
  - byte、short、int或者char
  - 从Java SE 7开始，switch支持字符串String类型
  - 同时case标签必须为字符串常量或字面量

```java
switch(expression){
  case value1 :
    //语句
    break; //可选 如果不写，会再执行下一个case，case穿透！
  case value2 :
    //语句
    break; //可选
  default : //可选
    //语句
}
```

## 循环结构

- while循环
- do...while循环
- for循环
- 在Java5中引入了一种主要用于数组的增强型for循环。

### while循环

- while是最基本的循环，它的结构为：

  ```java
  while (布尔表达式){
    //循环内容
  }
  ```

- 只要布尔表达式为true，循环就会一致执行下去。

- 我们大多数情况是会让循环停止下来的，我们需要一个表达式失效的方式来结束循环。

- 少部分情况需要循环一直执行，比如服务器的请求响应监听等。

- 循环条件一直为true就会造成无限循环【死循环】，我们正常的业务编程中应该尽量避免死循环。会影响程序性能或者造成程序卡死崩溃！

```java
public class WhileDemo01 {
    public static void main(String[] args) {
      //计算1+2+3+……+100
        int i = 0;
        int sum = 0;
        while (i<100){
            sum = sum + i;
            i++;
        }
        System.out.println(i);
    }
}
```

### do...while循环

- 对于while语句而言，如果不满足条件，则不能进入循环。但有时候我们需要即使不满足条件也至少要执行一次。

- do...while循环和while循环相似，不同的是，do...while循环至少会执行一次。

  ```java
  do{
    //代码语句
  }while(布尔表达式)
  ```

- while和do...while的区别

  - while先判断后执行，do...while先执行后判断。
  - do...while总是保证循环体会被至少执行一次，这是他们的主要差别。

### for循环

- 虽然所有的循环结构都可以用while或者do...while表示，但Java提供了另一种语句——for循环，使一些循环结构变得更加简单。

- for循环语句是支持迭代的一种通用结构，是最有效、最灵活的循环结构。

- for循环执行的次数实在执行前就决定的。语法格式如下：

  ```java
  for(初始化;布尔表达式;更新){
    //代码语句
  }
  //死循环
  for(;;){
    
  }
  ```

```java
//九九乘法表
public class ForDemo01 {
    public static void main(String[] args) {
        for (int i = 1; i <= 9; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(i+"*"+j+"="+(i*j)+"\t");
            }
            System.out.println();
        }
    }
}
```

### 增强for循环

- Java5引入了一种主要用于数组或集合的增强型for循环。

- Java增强for循环语法格式如下：

  ```java
  for(声明语句:表达式){
    //代码语句
  }
  ```

- 声明语句：声明新的局部变量，该变量的类型必须和数组元素的类型匹配。其作用域限定在循环语句块，其值与此时数组元素的值相等。

- 表达式：表达式是要访问的数组名，或者返回值为数组的方法。

```java
public class ForDemo02 {
    public static void main(String[] args) {
      //定义一个数组
        int[] numbers = {10,20,30,40};
        for (int x:numbers){
            System.out.println(x);
        }
    }
}
```

### break continue

- break在任何循环语句的主体部分，均可用break控制循环的流程。break用于强行退出循环，不执行循环中剩余的语句。（break语句也在switch语句中使用）

- continue语句在循环语句体中，用于终止某次循环过程，即跳过循环体中尚未执行的语句，接着进行下一次是否执行循环的判断。

- 关于goto关键字（了解）

  - goto关键字很早就在程序设计语言中出现。尽管goto仍是Java的一个保留字，但未在语言中得到正式使用；Java没有goto。然而，在break和continue这两个关键字的身上，我们仍然能看出一些goto的影子--带标签的break和continue。

  - “标签”是指后面跟一个冒号的标识符，如：label:

  - 对Java来说唯一用到标签的地方是在循环语句之前。而在循环之前设置标签的唯一理由是：我们希望在其中嵌套另一个循环，由于break和continue关键字通常只中断当前循环，但若随同标签使用，它们就会中断到存在标签的地方。

    ```java
    public class LabelDemo {
        public static void main(String[] args) {
            //打印101-150之间所有的质数
            int count = 0;
          //标签
            outer:
            for (int i = 101; i < 150; i++) {
                for (int j = 2; j < i/2; j++) {
                    if (i%j==0){
                        continue outer;
                    }
                }
                System.out.print(i+" ");
            }
        }
    }
    ```

# Java方法

## 何谓方法

- Java方法是语句的集合，它们在一起执行一个功能。
  - 方法是解决一类问题的步骤的有序组合
  - 方法包含于类或对象中
  - 方法在程序中被创建，在其他地方被引用
- 设计方法的原则：方法的本意是功能块，就是实现某个功能的语句块的集合。我们设计方法的时候，最好保持方法的原子性，**就是一个方法只完成一个功能，这样利于我们后期的扩展。**

## 方法的定义

- Java的方法类似于其他语言的函数，是一段用来完成特定功能的代码片段，一般情况下，定义一个方法包含一以下语法：
- 方法包含一个方法头和一个方法体。下面是一个方法的所有部分：
  - 修饰符：这是可选的，告诉编译器如何调用该方法。定义了该方法的访问类型。
  - 返回值类型：方法可能会返回值。returnValueType是方法返回值的数据类型。有些方法执行所需的操作，但没有返回值。在这种情况下，returnValueType是关键字void。
  - 方法名：是方法的实际名。方法名和参数表共同构成方法签名。
  - 参数类型：参数像是一个占位符。当方法被调用时，传递值给参数。这个值被称为实参或变量。参数列表是指方法的参数类型、顺序和参数的个数。参数时可选的，方法可以不包含任何参数。
    - 形式参数：在方法被调用时用于接收外界输入的数据。
    - 实参：调用方法时实际传给方法的数据。
  - 方法体：方法体包含具体的语句，定义该方法的功能。

```java
//public 修饰符 返回值类型 方法名（参数类型 参数名）
public static int add(int a,int b){
  //方法体
  //......
  return a+b;//返回值
}
```

## 方法调用

- 调用方法：对象名.方法名(实参列表)

- Java支持两种调用方法的方式，根据方法是否返回值来选择。

- 当方法返回一个值的时候，方法调用通常被当做一个值，例如：

  ```java
  int larger = max(30,40);
  ```

- 如果方法返回值是void，方法调用一定是一条语句。

  ```java
  System.out.println('Hello');
  ```

- **Java都是值传递。**

## 方法的重载

- 重载就是在一个类中，有相同的函数名称，但形参不同的函数。

- 方法的重载的规则：

  - 方法名称必须相同。
  - 参数列表必须不同（个数不同、类型不同、参数排列顺序不同等）。
  - 方法的返回类型可以相同也可以不同。
  - 仅仅返回类型不同不足以成为方法的重载。

- 实现理论：

  方法名称相同时，编译器会根据调用方法的参数个数、参数类型等去逐个匹配，以选择对应的方法，如果匹配失败，则编译器报错。

## 命令行传参

有时候你希望运行一个程序的时候再传递给它消息。这要靠传递命令行参数给main()函数实现。

```java
public class CommandLine {
  public static void main(String args[]){
    for(int i=0;i<args.length;i++){
      System.out.println("args["+i+"]:"+args[i]);
    }
  }
}
```

在命令行中运行编译然后执行。

```
javac CommandLine
java CommandLine this is args
```

## 可变参数

- JDK1.5开始，Java支持传递同类型的可变参数给一个方法。
- 在方法声明中，在指定参数类型后面加一个省略号（...）。
- **一个方法中只能指定一个可变参数，它必须是方法的最后一个参数。**任何普通的参数必须在它之前声明。

```java
public static void printMax(double... numbers){
  if(numbers.length == 0){
    System.out.println("No argument passed");
    return;
  }
  
  double result = numbers[0];
  
  //排序
  for(int i = 1; i < numbers.length; i++){
    if(numbers[i]>result){
      result = numbers[i];
    }
  }
  System.out.println(result);
}

printMax(1,2,3,4,5);
printMax(new Double[]{1,2,3,4,5})
```

## 递归

- 普通的方法调用是A调用B，递归就是A调用A。
- 利用递归可以用简单的程序来解决一些复杂的问题。它通常把一个大型复杂的问题层层转化为一个与原问题相似的规模较小的问题来求解，递归策略只需少量的程序就可以描述出解题过程所需要的多次重复计算，大大地减少了程序的代码量。递归的能力在于用有限的语句来定义对象的无限集合。
- 递归结构包括两个部分：
  - 递归头：什么时候不调用自身的方法。如果没有头，将陷入死循环。
  - 递归体：什么时候需要调用自身方法。

```java
//计算阶乘 5!=5*4*3*2*1
public static int f(int n){
  if(n==1){
    return 1;
  }else{
    return f(n-1);
  }
}
```

# Java数组

## 数组的定义

- 数组是相同类型数据的有序集合
- 数组描述的是相同类型的若干个数据，按照一定的先后次序排列组合而成
- 其中，每个数据称作一个数组元素，每个数组元素可以通过一个下标来访问它们

## 数组声明创建

- 首先必须声明数组变量，才能在程序使用数组。下面是声明数组变量的语法：

  ```java
  dataType[] arrayRefVar; //首选的方法
  dataType arrayRefVar[]; //效果相同，但不是首选的方法
  ```

- Java语言使用new操作符来创建数组，语法如下：

  ```java
  dataType[] arrayRefVar = new dataType[arraySize];
  ```

- 数组的元素是通过索引访问的，数组索引从0开始。

- 获取数组的长度：

  ```java
  arrays.length
  ```

## 数组的初始化及内存简单分析

- 静态初始化

  ```java
  int[] a = {1,2,3};
  Man[] mans = {new Man(1,1),new Man(2,2)};
  ```

- 动态初始化

  ```java
  int[] a = new int[2];//此时已经被默认初始化
  a[0]=1;
  a[1]=2;
  ```

- 数组的默认初始化

  数组是引用类型，它的元素相当于类的实例变量，因此数组一经分配空间，其中每个元素也被按照实例变量同样的方式被隐式初始化。

Java内存分析（简单分析）

- Java内存
  - 堆
    - 存放new的对象和数组
    - 可以被所有的线程共享，不会存放别的对象引用
  - 栈
    - 存放基本变量类型（会包含这个基本类型的具体数值）
    - 引用对象的变量（会存放这个引用在堆里面的具体地址）
  - 方法区
    - 可以被所有的线程共享
    - 包含了所有的class和static变量

## 数组基本特点

- 其长度是确定的。数组一旦被创建，它的大小就是不可改变的。
- 其元素必须是相同类型，不允许出现混合类型。
- 数组中的元素可以是任何数据类型，包括基本类型和引用类型。
- 数组变量属于引用类型，数组也可以看成是对象，数组中的每个元素相当于该对象的成员变量。数组本身就是对象，Java中对象是在堆中的，因此数组无论保存原始类型还是其他对象类型，**数组对象本身是在堆中的。**

## 数组边界

- 下标合法区间：[0,length-1]，如果越界就会报错

  ```java
  public static void main(String[] args){
    int[] a = new int[2];
    System.out.println(a[2]);
  }
  ```

- ArrayIndexOutOfBoundsException：数组下标越界异常！

- 小结：

  - 数组是相同数据类型（数据类型可以为任意类型） 的有序集合。
  - 数组也是对象。数组元素相当于对象的成员变量。
  - 数组的长度是确定的，不可变的。如果越界，会报错。

## 数组的使用

- 普通的for循环

  ```java
  int[] arrays = {1,2,3,4,5};
  for(int i=0;i<arrays.length;i++){
    System.out.println(arrays[i]);
  }
  ```

- for-each的使用 

  ```java
  int[] arrays = {1,2,3,4,5};
  //JDK1.5 没有下标
  for(int array: arrays){
    System.out.println(array);
  }
  ```

- 数组作方法入参

  ```java
  public static void printArray(int[] arrays){
    //方法代码
  }
  ```

- 数组作返回值

  ```java
  public static void printArray(int[] arrays){
    int[] res = new int[arrays.length];
    //反转
    for(int i=0,j=res.length-1;i<arrays.length;i++,j--){
      res[j]=arrays[i];
    }
    return res;
  }
  ```

## 多维数组

- 多维数组可以看成是数组的数组，比如二维数组就是一个特殊的一堆数组，其中每一个元素都是一个一维数组。

- 二维数组

  ```java
  int a[][] = new int[2][5];
  int[][] array = {{1,2},{3,4}};
  ```

## Arrays类

- 数组的工具类java.util.Arrays
- 由于数组对象本身并没有什么方法可以供我们调用，但API中提供了一个工具类Arrays供我们使用，从而可以对数据对象进行一些基本的操作。
- 查看JDK帮助文档。
- Arrays类中的方法都是static修饰的静态方法，在使用的时候可以直接使用类名进行调用，而“不用”使用对象来调用（注意：是“不用”而不是“不能”）
- 具有以下常用功能
  - 给数组赋值：通过fill方法。
  - 对数组排序：通过sort方法，按升序。
  - 比较数组：通过equals方法比较数组中元素值是否相等。
  - 查找数组元素：通过binarySearch方法能对排序好的数组进行二分查找法操作。

## 稀疏数组

- 当一个数组中大部分元素为0，或者为同一个值的数组时，可以使用稀疏数组来保存该数组。
- 稀疏数组的处理方式是：
  - 记录数组一共有几行几列，有多少个不同的值
  - 把具有不同值的元素和行列及值记录在一个小规模的数组中，从而缩小程序的规模

# 面向对象编程

Java的核心思想就是oop（面向对象编程）

## 初识面向对象

### 面向过程思想&面向对象思想

- 面向过程思想
  - 步骤清晰简单，第一步、第二步……
  - 面对过程适合处理一些较为简单的问题
- 面向对象思想
  - 物以类聚，分类的思维模式，思考问题首先会解决问题需要哪些分类，然后对这些分类进行单独思考。最后，才对某个分类下的细节进行面向过程的思索。
  - 面向对象适合处理复杂的问题，适合处理需要多人协作的问题。
- 对于描述复杂的事物，为了从宏观上把握、从整体上合理分析，我们需要使用面向对象的思路来分析整个系统。但是，具体到微观操作，仍然需要面向过程的思路去处理。

### 什么是面向对象

- 面向对象编程（Object-Oriented Programming, OOP）
- 面向对象编程的本质就是：以类的方式组织代码，以对象的组织（封装）数据
- 抽象
- 三大特性：封装、继承、多态
- 从认识论角度考虑是先有对象后有类。对象，是具体的事物。类，是抽象的，是对对象的抽象
- 从代码运行角度考虑是先有类后有对象。类是对象的模版

### 类与对象的关系

- 类是一种抽象的数据类型，它是对某一类事物整体描述/定义，但是并不能代表某一个具体的事物
  - 动物、植物、手机、电脑……
  - Person类、Pet类、Car类等，这些类都是用来描述/定义某一类具体的事物应该具备的特点和行为
- 对象是抽象概念的具体实例
  - 张三就是人的一个具体实例，张三家里的旺财就是狗的一个具体实例
  - 能够体现出特点，展现出功能的是具体的实例，而不是抽象的概念

## 创建与初始化对象

- 使用new关键字创建对象
- 使用new关键字创建的时候，除了分配内存空间之外，还会给创建好的对象进行默认的初始化及对类中构造器的调用
- 类中的构造器也成为构造方法，是在进行创建对象的时候必须调用的。并且构造器有以下两个特点：
  - 必须和类的名字相同
  - 必须没有返回类型，也不能写void
- 构造器必须掌握！

```java
public class Student{
  //属性
  String name; //null
  int age; //0
  
  //方法
  public void study(){
    System.out.println(this.name+"在学习")
  }
}

public class Application{
  public static void main(String[] args){
    //类：抽象的，实例化
    //类实例化后会返回一个自己的对象
    //student对象就是一个student类的具体实例
    Student xiaoming = new Student();
    Student xh = new Student();
    
    xiaoming.name="小明";
    xiaoming.age=3;
    
    System.out.println(xiaoming.name);
    System.out.println(xiaoming.age);
    
    
    xh.name="小红";
    xh.age=4;
    
    System.out.println(xh.name);
    System.out.println(xh.age);
  }
}
```

```java
public class Person{
  //即使一个类什么都不写，它也会存在一个方法
  String name;
  //显式的定义构造器
  //实例初始化
  //无参构造
  public Person(){
    this.name = "jy";
  }
  //有参构造
  //一但定义了有参构造，无参构造必须显式定义
  //方法的重载
  //IDEA alt+insert快速创建构造函数
  public Person(String name){
    this.name = name;
  }
}
```

## 类与对象小结

1. 类与对象

   类是一个模板，抽象的。

   对象是一个具体的实例。

2. 方法

   定义，调用

3. 对应的引用

   引用类型：对象是通过引用来操作的（栈-->堆）

4. 属性

   字段Field 成员变量

   默认初始化

   修饰符 属性类型 属性名 = 属性值

5. 对象的创建和使用

   - 必须使用new关键字创造，构造器
   - 对象的属性
   - 对象的方法

6. 类

   静态的属性：属性

   动态的行为：方法

## 封装

- 该露的露，该藏的藏

  我们的程序设计要追求“高内聚，低耦合”。高内聚就是类的内部数据操作细节自己完成，不允许外部干涉；低耦合就是尽量暴露少量的方法给外部使用。

- 封装（数据的隐藏）

  通常，应禁止直接访问一个对象中数据的实际表示，而应通过操作接口来访问，这称为信息隐藏。

- 记住这句话就够了：**私有属性，get/set**

  ```java
  public class Student{
    private String name; //私有属性
    //外部不可直接操作
    //提供一些可以操作这个属性的方法
  
    //get 获取这个数据
    public String getName(){
      return this.name;
    }
    //set 设置这个数据
    public void getName(String name){
      this.name=name;
    }
  }
  ```

### 封装的意义

1. 提高代码安全性，保护数据
2. 隐藏代码的实现细节
3. 统一接口
4. 系统可维护性增加了

## 继承

- 继承的本质是对某一批类的抽象，从而实现对现实世界更好的建模。

- extands的意思是“拓展”。子类是父类的拓展。

- JAVA中类只有单继承，没有多继承。

- 继承是类和类之间的一种关系。除此之外，类和类之间的关系还有依赖、组合、聚合等。

- 继承关系的两个类，一个为子类（派生类），一个为父类（基类）。子类继承父类，使用关键字extends来表示。

- 子类和父类之间，从意义上讲应该具有“is a”的关系。

- object类

  在java中，所有的类都直接或者间接地继承Object类

- super

  当前类用this，父类用super

- 方法重写

  都是方法的重写，和属性无关

```java
//Student继承Person
//子类继承了父类，就会拥有父类的所有方法
//私有的东西无法被继承
public class Person /*extents Object*/ {
  //构造器
  public Person(){
    
  }
}
public class Student extents Person{
  //构造器
  public Student() {
    //可以隐藏，子类构造器自动调用父类无参构造
    super();//调用父类的构造器，必须要在子类构造器的第一行
  }
}
```

super注意点：

1. super调用父类的构造方法，必须在构造方法的第一个

2. super必须只能出现在子类的方法或者构造函数中

3. super和this不能同时调用构造方法

   ```java
   //不能同时调用
   spuer();
   this();
   ```

4. 和this的区别

   - 代表对象不同：this是调用者本身这个对象，super是代表父类对象的应用
   - this可以在非继承条件下使用，super只能在继承条件下调用
   - this()本类的构造，super()父类的构造

```java
//A类继承B类，两者都有静态方法test
public class B{
  public static void test(){
    System.out.println("B")
  }
}
public class A extents B{
  public static void test(){
    System.out.println("A")
  }
}
//方法的调用只和左边定义的数据类型有关
A a = new A();
a.test(); //A
B b = new A(); //父类的引用指向了子类
b.test(); //B
```

```java
public class B{
  public void test(){
    System.out.println("B")
  }
}
public class A extents B{
  
  //重写
  @Override
  public void test(){
    System.out.println("A")
  }
}
A a = new A();
a.test(); //A
B b = new A();
b.test(); //A
```

重写：需要有继承关系，子类重写父类的方法

1. 方法名必须相同
2. 参数列表必须相同
3. 修饰符：范围可以扩大单不能缩小（public>Protected>Default>private）
4. 抛出的异常：范围可以被缩小，但不能放大
5. 为什么要重写：父类的功能，子类不一定需要
6. 不能被重写的：
   - static方法，属于类，不属于实例
   - final 常量
   - private方法

## 多态

- 即同一个方法可以根据发送对象的不同而采用多种不同的行为方式。

- 一个对象的实际类型是确定的，但可以指向对象的引用的类型有很多（父类，有关系的类）。

  ```java
  Student s1 = new Student();
  Person s2 = new Student();
  Object s3 = new Student();
  ```

- 多态存在的条件

  - 有继承关系
  - 子类重写父类方法
  - 父类引用指向子类对象

- 注意多态是方法的多态，属性没有多态。

- instanceof（类型转换 引用类型）

  instanceof必须要存在父子关系才能通过编译，否则无法使用

```java
//Object > String
//Object > Person > Teacher
//Object > Person > Student
Object obj = new Student;
System.out.println(obj instanceof Student); //true
System.out.println(obj instanceof Person); //true
System.out.println(obj instanceof Object); //true
System.out.println(obj instanceof Teacher); //false
System.out.println(obj instanceof String); //false

Person obj1 = new Student;
System.out.println(obj1 instanceof Student); //true
System.out.println(obj1 instanceof Person); //true
System.out.println(obj1 instanceof Object); //true
System.out.println(obj1 instanceof Teacher); //false
//System.out.println(obj1 instanceof String); //编译报错

Student obj2 = new Student;
System.out.println(obj2 instanceof Student); //true
System.out.println(obj2 instanceof Person); //true
System.out.println(obj2 instanceof Object); //true
//System.out.println(obj2 instanceof Teacher); //编译报错
//System.out.println(obj1 instanceof String); //编译报错
```

## static详解

```java
//静态导入包
import static java.lang.Math.PI;

public class Static {
    private static int age; //静态的变量 （多线程）
    private double score; //非静态的变量
    //2执行顺序 赋初始值
    {
        //匿名代码块
        System.out.println("匿名代码块");
    }
    //1执行顺序 只执行一次
    static {
        //静态代码块
        System.out.println("静态代码块");
    }
    //3执行顺序
    public Static(){
        //构造方法
        System.out.println("构造方法");
    }

    public void run(){
        System.out.println("run");
    }

    public static void go(){
        System.out.println("go");
    }

    public static void main(String[] args) {
        Static s1 = new Static();
				Static s2 = new Static();
        System.out.println(Static.age); //0
        //System.out.println(Static.score); //Non-static field 'score' cannot be referenced from a static context
        System.out.println(s1.age); //0
        System.out.println(s1.score); //0.0

        //Static.run(); //Non-static method 'run()' cannot be referenced from a static context
        Static.go();
        s1.run();
        s1.go();
    }
}
```

## 抽象类

- abstract修饰符可以用来修饰方法也可以修饰类，如果修饰方法，那么该方法就是抽象方法；如果抽象类，那么该类就是抽象类。
- 抽象类，不能使用new关键字来创建对象，它是用来让子类继承的。
- 抽象方法，只有方法的声明，没有方法的实现，它是用来让子类实现的。
- 子类继承抽象类，那么就必须要实现抽象类没有实现的抽象方法，否则该子类也要声明为抽象类。

```java
//abstract抽象类 类是单继承 接口可以实现多继承
public abstract class Action {
    //添加约束，由创建者实现
    //abstract，抽象方法，只有方法名字，没有方法实现
    public abstract void doSomething();
  	//抽象类中可以写普通方法，抽象方法必须在抽象类中
}

//抽象类的所有方法，继承了它的子类都必须要实现它的方法
//如果子类也是abstract抽象类，则由子子类继承实现
public class A extends Action{
    @Override //必须方法重写
    public void doSomething() {

    }
}
```

## 接口

- 普通类：只有具体实现
- 抽象类：具体实现和规范（抽象方法）都有
- 接口：只有规范，自己无法写方法，专业的约束。约束和实现分离：面向接口编程



- 接口就是规范，定义的是一组规则，体现了现实世界中“如果你是……则必须能……”的思想。例如：如果你是汽车，则必须能跑。
- 接口的本质是契约，就像我们人间的法律一样。制定好后大家都遵守。
- OO的精髓，是对对象的抽象，最能体现这一点的就是接口。为什么我们讨论设计模式都只针对具备了抽象能力的语言（比如java、c++、c#等），就是因为设计模式所研究的，实际上就是如何合理的去抽象。
- 声明类的关键字是class，声明接口的关键字是interface

```java
//interface 定义的关键字，接口都需要有实现类
//接口中没有构造方法，不能被实例化
public interface Demo {

    //默认定义为常量 public static final
    int AGE = 99;

    //接口中所有定义的方法其实都是抽象的public abstract
    void add(String name);
    void delete(String name);
    void update(String name);
    void query(String name);

}
public interface Demo2 {
    void run();
}
// 抽象类 extents
//类 可以实现接口 implements接口
//实现了接口的类 就需要重写接口中的方法

//多继承通过接口实现多继承
public class Demo1 implements Demo,Demo2{
    @Override
    public void add(String name) {

    }

    @Override
    public void delete(String name) {

    }

    @Override
    public void update(String name) {

    }

    @Override
    public void query(String name) {

    }

    @Override
    public void run() {

    }
}
```

## 内部类

- 内部类就是在一个类的内部定义一个类，比如，A类中定义一个B类，那么B类相对A类来说就成为内部类，而A类相对于B类来说就是外部类。
- 1、成员内部类
- 2、静态内部类
- 3、局部内部类
- 4、匿名内部类

```java
public class Demo03 {

    private int id;
    public void out(){
        System.out.println("这是一个外部类方法");
    }
		//成员内部类,静态内部类加一个static
    class Inner{
        public void in(){
            System.out.println("这是一个内部类方法");
          //局部内部类
          	class In(){
              
            }
        }
      //获得外部类的私有属性
        public void getID(){
            System.out.println(id);
        }
    }
}
public class Demo01 {
    public static void main(String[] args) {
      
        Demo03 demo03 = new Demo03();
      	//通过这个外部类来实例化内部类
        Demo03.Inner inner = demo03.new Inner();
				inner.getID();
      	//匿名内部类
      	//没有名字初始化类，不用将实例保存到变量中
      	demo03.new Inner().getID();
    }
}
```

**内部类的场景还有很多，遇到再进行理解！**

# 异常机制

## 异常简单分类

- 检查性异常：最具代表的检查性异常是用户错误或问题引起的异常，这是程序员无法预见的。例如要打开一个不存在文件时，一个异常就发生了，这些异常在编译时不能被简单地忽略。
- 运行时异常：运行时异常是可能被程序员避免的异常。与检查性异常相反，运行时异常可以在编译时被忽略。
- 错误：错误不是异常，而是脱离程序员控制的问题。错误在代码中通常被忽略。例如，当栈溢出时，一个错误就发生了，它们在编译也检查不到的。

## 异常体系结构

- Java把异常当作对象来处理，并定义一个基类java.lang.Throwable作为所有异常的超类。
- 在Java API中已经定义了许多异常类，这些异常类分为两大类，错误Error和异常Exception。

### Error

- Error类对象由Java虚拟机生成并抛出，大多数错误与代码编写者所执行的操作无关。
- Java虚拟机运行错误（Virtual MachineError），当JVM不再有继续执行操作所需的内存资源时，将出现OutOfMemoryError。这些异常发生时，Java虚拟机（JVM）一般会选择线程终止。
- 还有发生在虚拟机试图执行应用时，如类定义错误（NoClassDefFoundError）、链接错误（LinkageError）。这些错误是不可查的，因为它们在应用程序的控制和处理能力之外，而且绝大数是程序运行时不允许出现的状况。

### Exception

- 在Exception分支中与一个重要的子类RunteimException（运行时异常）
  - ArrayIndexOutOfBoundsException（数组下标越界）
  - NullPointerException（空指针异常）
  - ArithmeticException（算术异常）
  - MissingResourceException（丢失资源）
  - ClassNotFoundException（找不到类）等异常，这些异常是不检查异常，程序中可以选择捕获处理，也可以不处理。
- 这些异常一般是由程序员逻辑错误引起的，程序应该从逻辑角度尽可能避免这类异常的发生。

Error和Exception的区别：Error通常是灾难性的致命的错误，是程序无法控制和处理的，当出现这些异常时Java虚拟机（JVM）一般会选择终止线程；Exception通常情况下是可以被程序处理的，并且在程序中应该尽可能的去处理这些异常。

## 异常处理机制

- 抛出异常

- 捕获异常

- 异常处理的五个关键字

  try、catch、finally、throw、throws

```java
public class Demo04 {

    public static void main(String[] args) {
        int a=1;
        int b=0;

        //如果需要捕获多个异常 需要从小到大捕获异常类型
        try { //try监控区域
            System.out.println(a/b);
        }catch (ArithmeticException e){ //捕获异常 catch里面的参数就是想要捕获异常的类型 可以写多个catch
            System.out.println("error");
        }finally { //处理善后 不管是否出错都会最后执行
            System.out.println("finally");
        }
        // finally可以不要
    }
    //假设方法处理不了这个异常，方法上主动抛出异常
    public void test(int a,int b) throws ArithmeticException{
        if (b==0){
            throw new ArithmeticException(); //主动抛出异常 一般在方法中使用
        }
    }
}
```

## 自定义异常

- 使用Java内置的异常类可以描述在编程时出现的大部分异常情况。除此之外，用户还可以自定义异常。用户自定义异常类，只需要继承Exception类即可。
- 在程序中使用自定义异常类，大体可以分为以下几个步骤：
  1. 创建自定义异常类。
  2. 在方法中通过throw关键字抛出异常对象。
  3. 如果在当前抛出异常的方法中处理异常，可以使用try-catch语句捕获并处理；否则在方法的声明处通过throws关键字指明要抛出给方法调用者的异常，继续进行下一步操作。
  4. 在出现异常方法的调用者中捕获并处理异常。

```java
//自定义的异常类
public class Demo05 extends Exception{

    private int detail;
    
    public Demo05(int a){
        this.detail = a;
    }
    //toString 打印错误信息
    @Override
    public String toString() {
        return "Demo05{" +
                "detail=" + detail +
                '}';
    }
}
```

### 实际应用中的经验总结

- 处理运行异常时，采用逻辑去合理规避同时辅助try-catch处理
- 在多重catch块后面可以加一个catch(Exception)来处理可能被遗漏的异常
- 对于不确定的代码，也可以加上try-catch，处理潜在的异常
- 尽量去处理异常，切忌只是简单的调用printStackTrace()去打印输出
- 具体如何处理异常，要根据不同的业务需求和异常类型去决定
- 尽量添加finally语句块去释放占用的资源