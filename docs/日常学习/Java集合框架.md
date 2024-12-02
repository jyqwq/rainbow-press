---
title: Java集合框架
tags:
  - 笔记
  - 学习
  - Java
  - 待续
createTime: 2021/10/11
permalink: /article/k7wp0pof/
---
# Java集合框架

## 集合

- 概念：对象的容器，定义了多个对象进行操作的常用方法。可以实现数组的功能。
- 和数组的区别：
  - 数组长度固定，集合长度不固定
  - 数组可以存储基本类型和引用类型，集合只能存储引用类型
- 位置：Java.util.*

## Collection体系集合

- Interface Collection（该体系结构的根接口，代表一组对象，称为集合）
  - Interface List（有序、有下标、元素可重复）
    - Class ArrayList
    - Class LinkedList
    - Class Vector
  - Interface Set（无序、无下标、元素不能重复）
    - Class HashSet
    - Interface SortedSet
      - Class TreeSet

## Collection父接口

- 特点：代表一组任意类型的对象，无序、无下标、不能重复。

- 方法：

  | 方法                         | 描述                                 |
  | ---------------------------- | ------------------------------------ |
  | boolean add(Object obj)      | 添加一个对象                         |
  | boolean addAll(Collection c) | 将一个集合中的所有对象添加到此集合中 |
  | void clear()                 | 清空此集合中的所有对象               |
  | boolean contains(Object o)   | 检查此集合中是否包含o对象            |
  | boolean equals(Object o)     | 比较此集合是否与指定对象相等         |
  | boolean isEmpty()            | 判断此集合是否为空                   |
  | boolean remove(Object o)     | 在此集合中移除o对象                  |
  | int size()                   | 返回此集合中的元素个数               |
  | Object[] toArray()           | 将此集合转换成数组                   |
  | Inerator integrator()        | 返回在此集合的元素上进行迭代的迭代器 |

```java
public class Demo01 {
    public static void main(String[] args) {
        //创建集合
        Collection arrayList = new ArrayList();
        //添加元素
        arrayList.add("apple");
        arrayList.add("banana");
        arrayList.add("banana1");
        arrayList.add("banana2");
        System.out.println(arrayList.size());
        System.out.println(arrayList);
        //删除元素
        arrayList.remove("apple");
        System.out.println(arrayList.size());
        //遍历元素
        //1 使用增强for
        for (Object obj:arrayList) {
            System.out.println(obj);
        }
        //使用迭代器
        Iterator iterator = arrayList.iterator();
        while (iterator.hasNext()){
            String next = (String) iterator.next();
            System.out.println(next);
            //不能使用collection的删除方法
            iterator.remove();
        }
        //判断
        System.out.println(arrayList.contains("banana"));
    }
}
```

```java
public class Demo02 {
    public static void main(String[] args) {
        //新建Collection对象
        Collection arrayList = new ArrayList();
        Student s1 = new Student("张三", 20);
        Student s2 = new Student("李四", 18);
        Student s3 = new Student("王五", 22);
        //添加数据
        arrayList.add(s1);
        arrayList.add(s2);
        arrayList.add(s3);
        //删除
        arrayList.remove(s1);
        //清空
        arrayList.clear();
        //遍历
        //增强for
        for (Object obj:arrayList) {
            Student obj1 = (Student) obj;
            System.out.println(obj1.toString());
        }
        //迭代器
        Iterator iterator = arrayList.iterator();
        while (iterator.hasNext()){
            Student i = (Student) iterator.next();
            System.out.println(i.toString());
        }
        //判断
        System.out.println(arrayList.contains(s1));
    }
}
```

## List集合

### List子接口

- 特点：有序、有下标、元素可重复。

- 方法：

  | 方法                                    | 描述                                        |
  | --------------------------------------- | ------------------------------------------- |
  | void add(int index,Object o)            | 在index位置插入对象o                        |
  | Boolean addAll(int index,Collection c)  | 将一个集合中的元素添加到此集合中的index位置 |
  | Object get(int index)                   | 返回集合中指定位置的元素                    |
  | List subList(int fromIndex,int toIndex) | 返回fromIndex和toIndex之间的集合元素        |


```java
public class Demo03 {
    public static void main(String[] args) {
        List list = new ArrayList<>();
        //添加元素
        list.add("apple");
        list.add("banana");
        list.add(2,"pair");
        System.out.println(list.size());
        System.out.println(list.toString());
        //删除元素
        list.remove("apple");
        //遍历
        //for
        for (int i = 0; i < list.size(); i++) {
            System.out.println(list.get(i));
        }
        //增强for
        for (Object obj:list) {
            System.out.println(obj);
        }
        //迭代器
        Iterator iterator = list.iterator();
        while (iterator.hasNext()){
            System.out.println(iterator.next());
        }
        //列表迭代器 可以向前或者向后遍历，可以添加删除修改元素
        ListIterator listIterator = list.listIterator();
        //从前往后
        while (listIterator.hasNext()){
            System.out.println(listIterator.nextIndex()+":"+listIterator.next());
        }
        //从后往前
        while (listIterator.hasPrevious()){
            System.out.println(listIterator.previousIndex()+":"+listIterator.previous());
        }
        //判断
        System.out.println(list.contains("apple"));
        System.out.println(list.isEmpty());
        //获取位置
        System.out.println(list.indexOf("apple"));
    }
}
```

```java
public class Demo04 {
    public static void main(String[] args) {
        List list = new ArrayList<>();
        //添加数字数据 添加基本类型会自动装箱
        list.add(20);
        list.add(30);
        list.add(40);
        list.add(50);
        list.add(60);
        System.out.println(list.size());
        System.out.println(list.toString());
        //删除
        //list.remove(0);
        //list.remove((Object) 20);
        list.remove(new Integer(20));
        //返回子集合,含头不含尾
        List list1 = list.subList(1, 3);
        System.out.println(list1.toString());
    }
}
```

## List实现类

- ArryList【重点】：
  - 数组结构实现，查询快、增删慢
  - JDK1.2版本，运行效率快、线程不安全
- Vector：
  - 数组结构实现，查询快、增删慢
  - JDK1.0版本，运行效率慢、线程安全
- LinkedList：
  - 链表结构实现，增删快，查询慢

```java
public class Demo05 {
    public static void main(String[] args) {
        ArrayList<Object> objects = new ArrayList<>();
        Student a = new Student("a", 10);
        Student b = new Student("b", 10);
        Student c = new Student("c", 10);
        //添加
        objects.add(a);
        objects.add(b);
        objects.add(c);
        System.out.println(objects.size());
        System.out.println(objects.toString());
        //删除
        objects.remove(0);
        System.out.println(objects.size());
        //遍历
        //迭代器
        Iterator<Object> iterator = objects.iterator();
        while (iterator.hasNext()){
            Student next = (Student) iterator.next();
            System.out.println(next.toString());
        }
        //列表迭代器
        ListIterator<Object> objectListIterator = objects.listIterator();
        while (objectListIterator.hasNext()){
            Student next = (Student) objectListIterator.next();
            System.out.println(next.toString());
        }
        while (objectListIterator.hasPrevious()){
            Student next = (Student) objectListIterator.previous();
            System.out.println(next.toString());
        }
    }
}
```

### 源码分析

- ArrayList：

  - 默认容量：DEFAULT_CAPACITY=10（如果没有向集合中添加任何元素时，容量为0）

  - 存放元素的数组：elementData

  - 实际元素个数：size

    - 添加元素：add()，源码如下：（添加第一个元素后，容量变为10，每次扩容都是原来的1.5倍）

    ```java
        public boolean add(E e) {
            ensureCapacityInternal(size + 1);  // Increments modCount!!
            elementData[size++] = e;
            return true;
        }
    
        private static int calculateCapacity(Object[] elementData, int minCapacity) {
            if (elementData == DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
                return Math.max(DEFAULT_CAPACITY, minCapacity);
            }
            return minCapacity;
        }
    
        private void ensureCapacityInternal(int minCapacity) {
            ensureExplicitCapacity(calculateCapacity(elementData, minCapacity));
        }
    
        private void ensureExplicitCapacity(int minCapacity) {
            modCount++;
    
            // overflow-conscious code
            if (minCapacity - elementData.length > 0)
                grow(minCapacity);
        }
    
        private void grow(int minCapacity) {
            // overflow-conscious code
            int oldCapacity = elementData.length;
            int newCapacity = oldCapacity + (oldCapacity >> 1);
            if (newCapacity - minCapacity < 0)
                newCapacity = minCapacity;
            if (newCapacity - MAX_ARRAY_SIZE > 0)
                newCapacity = hugeCapacity(minCapacity);
            // minCapacity is usually close to size, so this is a win:
            elementData = Arrays.copyOf(elementData, newCapacity);
        }
    ```

