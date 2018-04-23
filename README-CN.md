
<p align="center">
  <a href="##qone"><img src="./asset/qone.png" alt="qone"></a>
</p>
<p align="center">
下一代 Web 查询语言，使 javascript 支持 LINQ 
</p>

[English](./README.md) | 简体中文

## 缘由

最近的刚好改了腾讯文档 Excel 表格公式的一些 bug，主要是修改公式的 parser 。比如下面的脚本怎么转成 javascript 运行？

``` js
= IF(SUM(J6:J7) + SUM(J6:J7) > 10, "A2 是 foo", "A2 不是 foo")
```

公式或一些脚本语言的实现包含几个主要步骤:

    scanner > lexer > parser > ast > code string

得到 code string 之后可以动态运行，比如 js 里使用 eval ，eval 能保留上下文信息，缺点是执行代码包含编译器代码，eval 的安全性等。
得到 code string 之后也可直接使用生成的 code string 运行，缺点是依赖构建工具或者编辑器插件去动态替换源代码。

比如 wind 同时支持 JIT 和 AOT, qone 的思路和上面类似，但不完全相同， qone 的如下:

    scanner > lexer > parser > ast > method(ast)

这个后面写原理时候再细说。

总的来说，因为腾讯文档公式相关工作、早年的 kmdjs 开发 (uglify2) 和 .NET 开发，所以有了 qone 。    

- [LINQ](#LINQ)
- [qone 安装](#qone-安装)
- [qone 关键字与运算符](#qone-关键字与运算符)
- [qone 方法注入](#qone-方法注入)      
- [qone select 输出](#qone-select-输出)   
- [qone orderby](#qone-orderby)
- [qone groupby](#qone-groupby)
- [qone 多数据源](#qone-多数据源)
- [qone 嵌套子数据源](#qone-嵌套子数据源)
- [qone limit 与分页查询](#qone-limit-与分页查询)
---

## LINQ

 LINQ (语言集成查询) 是 .NET Framework 3.5 版中引入的一项创新功能。在 Visual Studio 中，可以用 Visual Basic 或 C# 为以下数据源编写 LINQ 查询：SQL Server 数据库、XML 文档、ADO.NET 数据集，以及可枚举的 Objects(即 LINQ to Objects)。

qone 是一款让 Web 前端工程师在 javascript 使用 .NET 平台下类似 LINQ 语法的前端库。qone 让 Web 前端工程师通过字符串的形式实现了 LINQ to Objects 的调用（下面统一叫做 qone to objects），Objects即 JSON 组成的 Array。举个简单的例子(qone 远比下面的例子强大):

``` js
var list = [
    { name: 'qone', age: 1 },
    { name: 'linq', age: 18 },
    { name: 'dntzhang', age: 28 }
]

var result = qone({ list }).query(`
            from n in list   
            where n.age > 18
            select n
        `)

assert.deepEqual(result, [{ "name": "dntzhang", "age": 28 }])
```

与 LINQ 一样，和 SQL 不同，qone 的 from 也在前面，为后面语句能够有智能提示，qone 是基于 string 的实时编译，不是 javasript 的原生语法，所以虽然 from 写在前面但不支持智能提示，但可以专门为 qone 写个编辑器插件去实现智能提示，所以 qone 语法设计上依然把 from 放在前面。

从根本上说，qone to objects 表示一种新的处理集合的方法。 采用旧方法，您必须编写指定如何从集合检索数据的复杂的 foreach 循环。 而采用 qone 方法，您只需编写描述要检索的内容的声明性代码。
另外，与传统的 foreach 循环相比，qone 查询具有三大优势：

* 它们更简明、更易读，尤其在筛选多个条件时
* 它们使用最少的应用程序代码提供强大的筛选、排序和分组功能
* 无需修改或只需做很小的修改即可将它们移植到其他数据源

通常，您要对数据执行的操作越复杂，就越能体会到 qone 相较于传统迭代技术的优势。

## qone 安装

``` bash
npm install qone
```

## qone 关键字与运算符

* from
* in
* where
* select
* orderby 
* desc
* asc
* groupby
* limit

其中 from 和 in 一起使用，orderby 和 desc 或者 asc 一起使用。

from 也可以把子属性作为 dataSource:

``` js
from n in data.list   
```

qone 支持下面三类运算符:

* 括号：( )
* 比较运算符： = , > , < , >= , <= , != 
* 与或非: && , || , !

条件判断语句也支持 null, undefined, true, false。

通过上面各种组合，你可以写出很复杂的查询条件。比如:

``` js
qone({ list }).query(`
    from n in list   
    where !(n.age > 17 || n.age < 2) && n.name != 'dntzhang'
    select n
`)
```

也支持 bool 类型的查询:

``` js
var list = [
    { name: 'qone', age: 1, isBaby: true },
    { name: 'linq', age: 18 },
    { name: 'dntzhang', age: 28 }]

var result = qone({ list }).query(`
        from a in list       
        where a.isBaby && n.name = 'qone'
        select a
    `)

assert.deepEqual(result, [{ name: 'qone', age: 1, isBaby: true }])
```

其中 isBaby 是 bool 类型，同样的写法:
a.isBaby = true   (等同于: a.isBaby)
a.isBaby = false  (等同于: !a.isBaby)

## qone 方法注入

通过上面介绍发现 qone 不支持加减乘除位求模运算？怎么才能图灵完备？方法注入搞定一切！如下所示:

``` js
QUnit.test("Method test 8", function (assert) {
    var arr = [1, 2, 3, 4, 5]

    qone('square', function (num) {
        return num * num
    })

    qone('sqrt', function (num) {
        return Math.sqrt(num)
    })

    var result = qone({ arr }).query(`
      from n in arr   
      where  sqrt(n) >= 2 
      select { squareValue : square(n) }
  `)

    assert.deepEqual(result, [{ "squareValue": 16 }, { "squareValue": 25 }])
})
```

方法也是支持多参数传入，所以可以写出任意的查询条件。其中select, where, orderby, groupby 语句都支持方法注入。

## qone select 输出

通过 select 可以输出各种格式和字段的数据:

``` js
QUnit.test("Select JSON test", function (assert) {
    var list = [
        { name: 'qone', age: 1 },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }
    ]

    var result = qone({ list }).query(`
                from n in list   
                where n.age < 20
                select {n.age, n.name}
            `)

    assert.deepEqual(result, [
        { "age": 1 , "name": "qone" },
        { "age": 18, "name": "linq" }
    ])

})
``` 

把所有场景列举一下:

* `select n` 输出源 item
* `select n.name` 输出一维表
* `select n.name, n.age` 输出二维表
* `select { n.age, n.name }` 缺省方式输出 JSON Array(key自动使用 age 和 name)
* `select { a: n.age, b: n.name }` 指定 key 输出 JSON Array
* `select { a: methodName(n.age), b: n.name }` 注入方法
* `select methodName(n.age), n.name` 注入方法
* `select methodName(n.age, n.name, 1, true, 'abc')` 注入方法并传递参数


## qone orderby


``` js
var result = qone({ list }).query(`
                from n in list   
                where n.age > 0
                orderby n.age asc, n.name desc
                select n
            `)

``` 

如果没有标记 asc 或者 desc，使用默认排序 asc。

## qone groupby

``` js
QUnit.test("Simple groupby test 1", function (assert) {
    var list = [
        { name: 'qone', age: 1 },
        { name: 'linq', age: 18 },
        { name: 'dntzhang1', age: 28 },
        { name: 'dntzhang2', age: 28 },
        { name: 'dntzhang3', age: 29 }
    ]

    var result = qone({ list }).query(`
                from n in list   
                where n.age > 18
                groupby n.age
            `)

    assert.deepEqual(result, [
        [{ "name": "dntzhang1", "age": 28 }, { "name": "dntzhang2", "age": 28 }],
        [{ "name": "dntzhang3", "age": 29 }]])

})
```

groupby 可以作为结束语句，不用跟着也不能跟着 select 语句，groupby 也可以支持方法注入。

## qone 多数据源 

``` js
QUnit.test("Multi datasource with props condition", function (assert) {

    var listA = [
        { name: 'qone', age: 1 },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }]


    var listB = [
        { name: 'x', age: 11 },
        { name: 'xx', age: 18 },
        { name: 'xxx', age: 13 }
    ]

    var result = qone({ listA, listB }).query(`
            from a in listA     
            from b in listB      
            where a.age = b.age
            select a, b
        `)

    assert.deepEqual(result, [[{ "name": "linq", "age": 18 }, { "name": "xx", "age": 18 }]])
})
```

多数据源会产生笛卡儿积。

## qone 嵌套子数据源

``` js
QUnit.test("Multi deep from test ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true, colors: [{ xx: [1, 2, 3] }, { xx: [11, 2, 3] }] },
        { name: 'linq', age: 18, colors: [{ xx: [100, 2, 3] }, { xx: [11, 2, 3] }] },
        { name: 'dntzhang', age: 28, colors: [{ xx: [1, 2, 3] }, { xx: [11, 2, 3] }] }]

    var result = qone({ list }).query(`
            from a in list   
            from c in a.colors   
            from d in c.xx  
            where d === 100
            select a.name, c,d
        `)

    assert.deepEqual(result, [["linq", { "xx": [100, 2, 3] }, 100]])
})
```

也可以和自身的数据源会产生笛卡儿积。

## qone limit 与分页查询

通过 limit 可以应付最常见的两种查询场景 - top N 和 分页。

查询top3:

``` js
QUnit.test("Limit top 3", function (assert) {
    var list = [
        { name: 'dntzhang1', age: 1 },
        { name: 'dntzhang2', age: 2 },
        { name: 'dntzhang3', age: 3 },
        { name: 'dntzhang4', age: 4 },
        { name: 'dntzhang5', age: 5 },
        { name: 'dntzhang6', age: 6 },
        { name: 'dntzhang7', age: 7 },
        { name: 'dntzhang8', age: 8 },
        { name: 'dntzhang9', age: 9 },
        { name: 'dntzhang10', age: 10 }
    ]

    var pageIndex = 1,
        pageSize = 4
    var result = qone({ list }).query(`
                    from n in list   
                    select n
                    limit 0, 3
                `)


    assert.deepEqual(result, [

        { name: 'dntzhang1', age: 1 },
        { name: 'dntzhang2', age: 2 },
        { name: 'dntzhang3', age: 3 }
    ])

})
``` 

分页查询:

``` js
QUnit.test("Limit one page test", function (assert) {
    var list = [
        { name: 'dntzhang1', age: 1 },
        { name: 'dntzhang2', age: 2 },
        { name: 'dntzhang3', age: 3 },
        { name: 'dntzhang4', age: 4 },
        { name: 'dntzhang5', age: 5 },
        { name: 'dntzhang6', age: 6 },
        { name: 'dntzhang7', age: 7 },
        { name: 'dntzhang8', age: 8 },
        { name: 'dntzhang9', age: 9 },
        { name: 'dntzhang10', age: 10 }
    ]

    var pageIndex = 1,
        pageSize = 4
    var result = qone({ list }).query(`
                    from n in list   
                    where n.age > 0
                    select n
                    limit ${pageIndex * pageSize}, ${pageSize}
                `)


    assert.deepEqual(result, [
    { name: 'dntzhang5', age: 5 },
    { name: 'dntzhang6', age: 6 },
    { name: 'dntzhang7', age: 7 },
    { name: 'dntzhang8', age: 8 }])

})
``` 

## star & fork & pr & repl & floow me

* [https://github.com/dntzhang/qone](https://github.com/dntzhang/qone)
* [https://dntzhang.github.io/qone](https://dntzhang.github.io/qone)
* [https://github.com/dntzhang](https://github.com/dntzhang)