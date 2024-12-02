---
title: Java常用类
tags:
  - 笔记
  - 学习
  - Java
createTime: 2021/10/11
permalink: /article/19onglcu/
---
# Java常用类

## 内部类

### 内部类的分类

- 成员内部类
- 静态内部类
- 局部内部类
- 匿名内部类

### 什么是内部类

- 概念：在一个类的内部再定义一个完整的类。

- 特点

  - 编译之后可生成独立的字节码文件
  - 内部类可直接访问外部类的私有成员，而不破坏封装

  ```java
  public class Demo01 {
      private String name="name";
      class Inner{
          public void show(){
              System.out.println(name);
          }
      }
  }
  ```

### 成员内部类

- 在类的内部定义，与实例变量、实例方法同级别的类。

- 外部类的一个实例部分，创建内部类对象时，必须依赖外部类对象。

- 当外部类、内部类存在重名属性时，会优先访问内部类属性。

- 成员内部类不能定义静态成员（static），但可以定义静态常量（final static）。

  ```java
  //外部类
  public class Demo02 {
      //实例变量
      private String name = "jy";
      private int age = 20;
  
      //内部类
      class Inner{
          private String address = "bj";
          private String phone = "110";
          private String name = "inner";
          //方法
          public void show(){
              //内外属性名相同优先访问内部属性
              System.out.println(name);
              //内外属性名相同访问外部类属性
              System.out.println(Demo02.this.name);
              System.out.println(age);
              System.out.println(address);
              System.out.println(phone);
          }
      }
  }
  ```

  ```java
  public class TestDemo02 {
      public static void main(String[] args) {
          //1.创建外部类对象
          Demo02 demo02 = new Demo02();
          //2.创建内部类对象
          Demo02.Inner inner = demo02.new Inner();
          //一步创建
          Demo02.Inner inner1 = new Demo02().new Inner();
      }
  }
  ```

### 静态内部类

- 不依赖外部类对象，可以直接创建或通过类名访问，可声明静态成员。

  ```java
  //外部类
  public class Demo03 {
      private String name="XXX";
      private int age = 18;
      //静态内部类，级别和外部类相同
      static class Inner{
          private String address = "sh";
          //静态成员
          private static int count = 100;
          public void show(){
              //调用外部类属性
              Demo03 demo03 = new Demo03();
              System.out.println(demo03.name);
              System.out.println(demo03.age);
              //调用静态内部类的属性和方法
              System.out.println(address);
              //调用静态内部类的静态属性
              System.out.println(Inner.count);
          }
      }
  }
  ```

  ```java
  public class TestDemo03 {
      public static void main(String[] args) {
          //直接创建静态内部类对象
          Demo03.Inner inner = new Demo03.Inner();
          inner.show();
      }
  }
  ```

### 局部内部类

- 定义在外部类方法中，作用范围和创建对象范围仅限于当前方法。

- 局部内部类访问外部类当前方法中的局部变量时因无法保障变量的生命周期与自身相同，变量必须修饰为final。

- 限制类的使用范围

  ```java
  public class Demo04 {
      private String name="test";
      private int age=35;
  
      public void show(){
          //定义局部变量
          String address = "sz";
          //局部内部类 注意不能添加任何访问修饰符 public等 适用范围只在show方法内
          class Inner{
              //定义局部内部类属性 final
              //不能定义静态变量 能定义静态常量
              private String phone = "123";
              public void show2(){
                  //访问外部类属性
                  System.out.println(Demo04.this.name);
                  System.out.println(age);
                  //访问内部类的属性
                  System.out.println(this.phone);
                  //访问局部变量，jdk1.7要求 变量必须是常量final 1.8以后会自动变为常量
                  System.out.println(address);
              }
          }
          //要想运行局部内部类需要在方法里面创建使用
          Inner inner = new Inner();
          inner.show2();
      }
  }
  ```

### 匿名内部类

- 没有类名的局部内部类（一切特征与局部内部类相同）。

- 必须继承一个父类或者实现一个接口。

- 定义类、实现类、创建对象的语法合并，只能创建一个该类的对象。

- 优点 ：代码量少。

- 缺点 ：可读性差。

  ```java
  public interface Demo05 {
      void service();
  }
  ```

  ```java
  public class TestDemo05 {
      public static void main(String[] args) {
          //使用匿名内部类，相当于创建了一个局部内部类
          Demo05 demo05 = new Demo05(){
              @Override
              public void service() {
                  System.out.println("服务启动了");
              }
          };
        	demo05.service();
      }
  }
  ```

## Object类

- 超类、基类，所有类的直接或者间接父类，位于继承树的最顶层。
- 任何类，如果没有直接书写extents显示继承某个类，都默认直接继承Object类，否则为间接继承。
- Object类中所定义的方法，是所有对象都具备的方法。
- Object类型可以存储任何对象。
  - 最为参数，可以接受任何返回值。
  - 作为返回值可以返回任何对象

### getClass()方法

- public final Class<?> getClass(){}
- 返回引用中存储的实际对象类型。
- 应用：通常用于判断两个引用中实际存储对象类型是否一致。

```java
Demo04 demo1 = new Demo04("11",2);
Demo04 demo2 = new Demo04("14",4);
Class class1 = demo1.getClass();
Class class2 = demo2.getClass();
if (class1==class2){
    System.out.println("类型一致");
}
```

### hashCode()方法

- public int hashCode(){}
- 返回该对象的哈希码值。
- 哈希值更具对象的地址或字符串或数字使用hash算法计算出来的int类型的数值。
- 一般情况下相同对象返回相同哈希码。

```java
Demo04 demo1 = new Demo04();
System.out.println(demo1.hashCode());
```

### toString()方法

- public String toString(){}

- 返回该对象的字符串表示（表现形式）。

- 可以根据程序需求覆盖该方法，如：展示对象各个属性值。

  mac的IDEA中可使用command+N选择快速重写toString方法

```java
Demo04 demo1 = new Demo04();
System.out.println(demo1.toString());
```

### equals()方法

- public boolean equals(Object obj){}
- 默认实现为（this==obj），比较两个对象地址是否相同。
- 可进行覆盖，比较两个对象的内容是否相同。重写步骤：
  - 比较两个引用是否指向同一个对象。
  - 判断obj是否为null。
  - 判断两个引用指向的实际对象类型是否一致。
  - 强制类型转换。
  - 依次比较各个属性值是否相同。

```java
Demo04 demo1 = new Demo04("11",2);
Demo04 demo2 = new Demo04("14",4);
System.out.println(demo1.equals(demo2)); //false
```

```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Demo04 demo04 = (Demo04) o;
    return age == demo04.age && Objects.equals(name, demo04.name);
}
```

### finalize()方法

- 当对象被判定为垃圾对象时，由JVM自动调用此方法，用以标记垃圾对象，进入回收队列。
- 垃圾对象：没有有效引用指向此对象时，为垃圾对象。
- 垃圾回收：由GC销毁垃圾对象，释放数据存储空间。
- 自动回收机制：JVM的内存耗尽，一次性回收所有垃圾对象。
- 手动回收机制：使用System.gc();通知JVM执行垃圾回收。

```java
//在类中重写finalize方法
@Override
protected void finalize() throws Throwable {
    super.finalize();
  	System.out.println("对象被回收");
}
```

```java
Demo04 demo1 = new Demo04("11",2);//　有指向不会被回收
new Demo04("14",4); //无指向被回收
System.gc();
System.out.println("垃圾回收");
```

## 包装类

### 什么是包装类

- 基本数据类型所对应的引用数据类型。
- Object可统一所有数据，包装类的默认值是null。
- 基本数据类型是放在栈中，没有提供方法；包装类是放在堆中，提供了方法。

### 包装类对应

| 基本数据类型 | 包装类型  |
| :----------: | :-------: |
|     byte     |   Byte    |
|    short     |   Short   |
|     int      |  Integer  |
|     long     |   Long    |
|    float     |   Float   |
|    double    |  Double   |
|   boolean    |  Boolean  |
|     char     | Character |

### 类型转换与装箱、拆箱

- 基本类型转换成包装类就是装箱（栈到堆）
- 包装类转成基本类型就是拆箱（堆到栈）

```java
public class Demo06 {
    public static void main(String[] args) {
        //基本数据类型
        int num1 = 18;
        Integer integer = new Integer(30);
        //装箱
        Integer integer1 = new Integer(num1);
        Integer integer2 = Integer.valueOf(num1);
        //拆箱
        int num2 = integer.intValue();
        //jdk1.5之前使用以上方式
        //1.5之后使用自动装箱拆箱
        //自动装箱 编译器会自动使用valueOf
        Integer integer3 = num1;
        //自动拆箱 编译器会自动使用intValue
        int num3 = integer3;
    }
}
```

- 8种包装类型提供不同类型间的转换方式：
  - Number父类中提供的6个共性方法。
  - parseXXX()静态方法

```java
//基本类型和字符串之间的转换
int n1 = 100;
//使用+实现
String s1 = n1+"";
//使用Integer中的toString()方法
String s2 = Integer.toString(n1);

//字符串转换成基本类型
String str = "150";
//使用Integer中的parseXXX方法
int n2 = Integer.parseInt(str);

//boolean类型的字符串形式转换成基本类型 "true"->true 只要非"true"->false
String str2 = "true";
boolean b1 = Boolean.parseBoolean(str2);
```

### 整数缓冲区

- Java预先创建了256个常用的整数包类型对象。
- 实际应用中，对已创建的对象进行复用。

```java
//面试题
Integer integer = new Integer(100);
Integer integer1 = new Integer(100);
System.out.println(integer==integer1); //false

Integer integer3 = 100; //这里会自动装箱 Integer.valueOf()
Integer integer4 = 100;
System.out.println(integer3==integer4); //true
//Integer缓冲区会自动生成-128-127之间的对象 所以这之间的数字会直接引用这些对象 其余的会重新创建对象
Integer integer5 = 200; //这里会自动装箱
Integer integer6 = 200;
System.out.println(integer5==integer6); //false
```

## String类

- 字符串是常量，创建之后不可改变。
- 字符串字面值存储在字符串池中，可以共享。
- String s = "hello";产生String对象。
- String s = new String("hello");产生String对象。

```java
String name = "hello"; //'hello'常量存储在字符串池中
name="张三"; //改变了指向关系 指向字符串池中的'张三' 原来的'hello'还存在字符串池中变成了垃圾 会被下次垃圾回收
String name2 = "张三"; //指向了字符串池中的 张三 实现了共享

//创建对象的过程中 字符串池中添加了 'Java' 堆中创建了String对象 栈中创建str 指向池和堆中的数据
//比较浪费空间
String str = new String("Java");
```

### 常用方法

- public int length() ：返回字符串的长度。
- public char charAt(int index) ：根据下标获取字符。
- public boolean contains(String str) ：判断当前字符串中是否包含str。
- public char[] toCharArray() ：将字符串转换成数组。
- public int indexOf(String str) ：查找str首次出现的下标，存在，则返回该下标；不存在，则返回-1。
- public int lastIndexOf(String str) ：查找字符串在当前字符串中最后一次出现的下标索引。
- public String trim() ：去掉字符串前后的空格。
- public String toUpperCase() ：将小写转换成大写。toLowerCase()大写转小写。
- public boolean endWith(String str) ：判断字符串是否以str结尾。startWith(String str) 是否str开头。
- public String replace(char oldChar,char newChar) ：将旧字符串替换成新字符串。
- public String[] split(String str) ：根据str做拆分。

```java
String name = "hello";
name.length(); //5
name.charAt(0); //h
name.contains("he");//true
Array.toString(name.toCharArray());//[h,e,l,l,o]
name.indexOf("l");//2
name.lastIndexOf("l");//3
```

```java
public class Demo09 {
    public static void main(String[] args) {
        String str = "this is a text";
        //1将单词取出
        String[] arr = str.split(" ");
        //2将str中的text替换为practice
        String str2 = str.replace("text","practice");
        //3在text前插入一个easy
        String str3 = str.replace("text","easy text");
        //4将每个单词的首字母变成大写
        StringBuilder newS = new StringBuilder();
        for (int i = 0; i < arr.length; i++) {
            char first = arr[i].charAt(0);
            char upperFirst = Character.toUpperCase(first);
            String newStr = upperFirst + arr[i].substring(1);
            newS.append(newStr).append(" ");
        }
        System.out.println(newS);
    }
}
```

### 可变字符串

- StringBuffer：可变长字符串，JDK1.0提供，运行效率慢、线程安全。
- StringBuilder：可变长字符串，JDK5.0提供，运行效率快、线程不安全。
- 比String效率高、节省内存。

```java
public class Demo10 {
    public static void main(String[] args) {
      //StringBuilder功能相同
        StringBuffer stringBuffer = new StringBuffer();
        //1 append();追加
        stringBuffer.append("java");
        //2 insert();添加
        stringBuffer.insert(0,"first");
        //3 replace();替换
        stringBuffer.replace(0,2,"hello");
        //4 delete();删除
        stringBuffer.delete(0,5);
    }
}
```

效率测试

```java
long start = System.currentTimeMillis();
String str = "";
for (int i = 0; i < 9999; i++) {
    str+=i;
}
long end = System.currentTimeMillis();
System.out.println(end-start);
```

```java
long start = System.currentTimeMillis();
StringBuilder str = new StringBuilder();
for (int i = 0; i < 9999; i++) {
    str.append(i);
}
long end = System.currentTimeMillis();
System.out.println(end-start);
```

## BigDecimal

很多实际应用中需要精确运算，而double是近似值存储，不在符合要求，需要使用BigDecimal

- 位置：java.math。
- 作用精确计算浮点数。
- 创建方式：BigDecimal bd = new BigDecimal("1.0");

```java
public class Demo12 {
    public static void main(String[] args) {
        double d1 = 1.0;
        double d2 = 0.9;
        System.out.println(d1-d2); //0.09999999998
        double res = (1.4-0.5)/0.9;
        System.out.println(res); //0.99999999999
        //BigDecimal，大的浮点数精确计算
        BigDecimal bigDecimal1 = new BigDecimal("1.0");
        BigDecimal bigDecimal2 = new BigDecimal("0.9");
        //减法
        BigDecimal r1 = bigDecimal1.subtract(bigDecimal2);
        System.out.println(r1); //0.1
        //加法
        BigDecimal r2 = bigDecimal1.add(bigDecimal2);
        //乘法
        BigDecimal r3 = bigDecimal1.multiply(bigDecimal2);
        //除法 保留2位数 向下取
        BigDecimal r4 = bigDecimal1.divide(bigDecimal2,2,BigDecimal.ROUND_HALF_DOWN);
    }
}
```

## Date类

- Date表示特定的瞬间，精确到毫秒。Date类中的大部分方法都已经被Calendar类中的方法所取代。

- 时间单位

```java
public class Demo13 {
    public static void main(String[] args) {
        Date date = new Date();
        //今天
        System.out.println(date.toString());
        //昨天
        Date date1 = new Date(date.getTime() - 60 * 60 * 24 * 1000);
        System.out.println(date1);
        //方法 after before
        boolean after = date1.after(date);
        boolean before = date1.before(date);
        
        //比较compareTo();
        int i = date.compareTo(date1);
        //比较是否相等
        boolean equals = date.equals(date1);
    }
}
```

## Calendar

- Calendar提供了获取或设置各种日历字段的方法。

- 构造方法

  - Protected Calendar()：由于修饰符是protected，所以无法直接创建该对象。

- 其他方法

  | 方法名                                                       | 说明                                         |
  | ------------------------------------------------------------ | -------------------------------------------- |
  | static Calendar getInstance()                                | 使用默认时区和区域获取日历                   |
  | void set(int year, int month,int date, int hourofday,int minute,int second) | 设置日历的年、月、日、时、分、秒             |
  | int get(int field)                                           | 返回给定日历字段的值。字段比如年、月、日等   |
  | void setTime(Date date)                                      | 用给定的Date设置此日历的时间。Date-Calendar  |
  | Date getTime()                                               | 返回一个Date表示此日历的时间。Calendar-Date  |
  | void add(int field,int amount)                               | 按照日历的规则，给指定字段添加或者减少时间量 |
  | Long getTimeInMillies()                                      | 毫秒为单位返回该日历的时间值                 |

```java
public class Demo14 {
    public static void main(String[] args) {
        //创建Calendar对象
        Calendar instance = Calendar.getInstance();
        //获取时间信息
        //获取年月日 时分秒
        int i1 = instance.get(Calendar.YEAR);
        int i2 = instance.get(Calendar.MONTH);
        int i3 = instance.get(Calendar.DAY_OF_MONTH);
        int i4 = instance.get(Calendar.HOUR_OF_DAY);
        int i5 = instance.get(Calendar.MINUTE);
        int i6 = instance.get(Calendar.SECOND);
        //修改时间
        Calendar instance1 = Calendar.getInstance();
        instance1.set(Calendar.DAY_OF_MONTH,5);
        //add方法修改时间
        instance1.add(Calendar.HOUR,-1);
    }
}
```

## SimpleDateFormat

- SimpleDateFormat是一个以语言环境有关的方式来格式化和解析日期的具体类。

- 进行格式化（日期——文本）、解析（文本——日期）。

- 常用的时间模式字母

  | 字母 | 时间或日期          | 示例 |
  | ---- | ------------------- | ---- |
  | y    | 年                  | 2019 |
  | M    | 年中月份            | 08   |
  | d    | 月中天数            | 10   |
  | H    | 1天中小时数（0-23） | 22   |
  | m    | 分钟                | 16   |
  | s    | 秒                  | 59   |
  | S    | 毫秒                | 367  |

```java
public class Demo15 {
    public static void main(String[] args) throws ParseException {
        //创建SimpleDateFormat对象
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy年MM月dd日 HH:mm:ss");
        //创建Date
        Date date = new Date();
        //格式化date
        String format = simpleDateFormat.format(date);
        System.out.println(format);
        //把字符串转成日期
        Date parse = simpleDateFormat.parse("2021年04月04日 22:51:52");
        System.out.println(parse);
    }
}
```

## System类

- System系统类，主要用于获取系统的属性数据和其他操作，构造方法私有的。

  | 方法名                           | 说明                                                    |
  | -------------------------------- | ------------------------------------------------------- |
  | static void arraycopy(...)       | 复制数组                                                |
  | static long currentTimeMillis(); | 获取当前系统时间，返回的是毫秒值                        |
  | static void gc();                | 建议JVM赶快启动垃圾回收器回收垃圾                       |
  | static void exit(int status);    | 退出JVM，如果参数是0表示正常退出JVM，非0表示异常退出JVM |

## 总结

- 内部类：
  - 在一个类的内部再定义一个完整的类。
  - 成员内部类、静态内部类、局部内部类、匿名内部类。
- Object类：
  - 所有类的直接或者间接父类，可存储任何对象。
- 包装类：
  - 基本数据类型所对应的引用数据类型，可以使Object统一所有数据。
- String类：
  - 字符串是常量，创建之后不可改变，字面值保存在字符串池中，可以共享。
- BigDecimal：
  - 可精确计算浮点数。
- Date：
  - 特定时间
- Calendar：
  - 日历
- SimpleDateFormat：
  - 格式化时间
- System：
  - 系统类

