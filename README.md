
<p align="center">
  <a href="##qone"><img src="./asset/qone.png" alt="qone"></a>
</p>
<p align="center">
Next-generation web query language, extend .NET LINQ for javascript
</p>

## The reason

Recently, it has just changed some bug of the Excel formula of the Tencent document, mainly modifying the parser of the formula.

For example, how can the following script be transformed to JavaScript?

``` js
= IF(SUM(J6:J7) + SUM(J6:J7) > 10, "A2 是 foo", "A2 不是 foo")
```

The implementation of formulas or scripting languages includes several main steps:

Scanner > lexer > parser > ast > code string

After getting code string, you can run (JIT) dynamically, such as using Eval in JS, Eval can retain context information, the disadvantage is that the execution code contains compiler code, and it is unsafe, and so on.
After getting code string, you can also use the generated code string to run (AOT) directly, and the disadvantage is to rely on the build tool or editor plug-in to dynamically replace the source code.

For example, wind supports JIT and AOT at the same time. Qone's thinking is similar to that above, but not exactly the same. Qone is as follows:

Scanner > lexer > parser > ast > method (AST)

The detailed principles will be written later. In general, the reasons are The work of the Tencent document formula, early kmdjs development (uglify2) and.NET development, so there is Qone.

- [LINQ](#LINQ)
- [qone install](#qone-install)
- [qone keyword and operator](#qone-keyword-and-operator)
- [qone method](#qone-method)      
- [qone select](#qone-select)   
- [qone orderby](#qone-orderby)
- [qone groupby](#qone-groupby) 
- [qone multiple data source](#qone-multiple-data-source)
- [qone subdata source](#qone-subdata-source)
- [qone limit and pagination](#qone-limit-and-pagination)
---

## LINQ

LINQ (language integrated query) is an innovative function introduced in.NET Framework 3.5. In Visual Studio, you can write LINQ queries with Visual Basic or C# for the following data sources: the SQL Server database, XML document, ADO.NET data set, and enumerable Objects.

Qone allows Web front-end engineers to use LINQ to Objects through js string or js template string, Objects is an array of JSON. Let me give you a simple example (Qone is much stronger than the following example):


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

Qone's `from` keyword is also in front like LINQ, with intelligent prompts for the later statements,but qone is real-time compilation based on string, not the native syntax of javasript, so although from is written in the front but does not support intelligent hints.

## qone install

``` bash
npm install qone
```

## qone keyword and operator

* from
* in
* where
* select
* orderby 
* desc
* asc
* groupby
* limit

from and in are used together, orderby and desc or asc are used together.

from can also take the sub attributes as dataSource:

``` js
from n in data.list   
```

Qone supports the following three class operators:

* brackets：( )
* comparison operator： = , > , < , >= , <= , != 
* and or not: && , || , !

Conditional judgement also supports null, undefined, true, false.

Through the above combinations, you can write complex query conditions. For example:

``` js
qone({ list }).query(`
    from n in list   
    where !(n.age > 17 || n.age < 2) && n.name != 'dntzhang'
    select n
`)
```

The bool type of query is also supported:

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

isBaby is the bool type, and the same way:
a.isBaby = true (equivalent to: a.isBaby)
a.isBaby = false (equivalent to: !a.isBaby)

## qone method

From the above, it is found that QOne does not support arithmetic operations of addition, subtraction, multiplication and division. How can be turing-complete ? Method injection to do everything! As shown below:

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

The method also supports the introduction of multiple parameters, so it can write arbitrary query conditions. select, where, orderby, groupby statements support method injection.

## qone select

select can output data of various formats and fields:

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

List all the scenes:

* `select n` Output source item
* `select n.name` Output one-dimensional table
* `select n.name, n.age` Output two-dimensional table
* `select { n.age, n.name }` Output JSON Array by default (key automatically uses age and name).
* `select { a: n.age, b: n.name }` Specify the key output JSON Array
* `select { a: methodName(n.age), b: n.name }` Injection method
* `select methodName(n.age), n.name` Injection method
* `select methodName(n.age, n.name, 1, true, 'abc')` Injection method and transfer parameters



## qone orderby


``` js
var result = qone({ list }).query(`
                from n in list   
                where n.age > 0
                orderby n.age asc, n.name desc
                select n
            `)

``` 

If no asc or desc is marked, use the default sort asc.

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

groupby can be used as an ending statement, without following or following select statements. groupby can also support method injection.

## qone qone multiple data source

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

The multi data source produces Cartesian product.

## qone subdata source

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

It can also produce Cartesian product with its own data source.

## qone limit and pagination

Limit can cope with the two most common query scenarios - top N and paging.

Query top3:

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

Paging query:

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