
QUnit.test("Basic test", function (assert) {
    var arr = [1, 2, 3, 4, 5]

    var result = qone({ arr }).query(`
        from n in arr   
        where n > 3
        select n
    `)

    assert.deepEqual(result, [4, 5])
})

QUnit.test("Query json array", function (assert) {
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

})

QUnit.test("Multi conditional query", function (assert) {
    var list = [
        { name: 'qone', age: 1 },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }
    ]

    var result = qone({ list }).query(`
                from n in list   
                where n.age > 10 && n.name = 'linq'
                select n
            `)

    assert.deepEqual(result, [{ "name": "linq", "age": 18 }])

})

QUnit.test("Select test", function (assert) {
    var list = [
        { name: 'qone', age: 1 },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }
    ]

    var result = qone({ list }).query(`
                from n in list   
                where n.age < 20
                select n.age, n.name
            `)

    assert.deepEqual(result, [[1, "qone"], [18, "linq"]])

})

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
        { "age": 1, "name": "qone" },
        { "age": 18, "name": "linq" }
    ])

})

QUnit.test("Select full JSON test", function (assert) {
    var list = [
        { name: 'qone', age: 1 },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }
    ]

    var result = qone({ list }).query(`
                from n in list   
                where n.age < 20
                select {a : n.age, b : n.name}
            `)

    assert.deepEqual(result, [
        { "a": 1, "b": "qone" },
        { "a": 18, "b": "linq" }
    ])

})

QUnit.test("|| conditional test", function (assert) {
    var list = [
        { name: 'qone', age: 1 },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }
    ]

    var result = qone({ list }).query(`
                from n in list   
                where n.age > 19 ||  n.age < 2
                select n
            `)

    assert.deepEqual(result, [
        { "name": "qone", "age": 1 },
        { "name": "dntzhang", "age": 28 }
    ])

})

QUnit.test("|| and && conditional test", function (assert) {
    var list = [
        { name: 'qone', age: 0 },
        { name: 'linq', age: 1 },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }
    ]

    var result = qone({ list }).query(`
                from n in list   
                where n.age > 17 || n.age < 2 && n.name != 'dntzhang'
                select n
            `)

    assert.deepEqual(result, [
        { "name": "qone", "age": 0 },
        { "name": "linq", "age": 1 },
        { "name": "linq", "age": 18 },
        { "name": "dntzhang", "age": 28 }])

})

QUnit.test("(), || and && conditional test", function (assert) {
    var list = [
        { name: 'qone', age: 0 },
        { name: 'linq', age: 1 },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }
    ]

    var result = qone({ list }).query(`
                from n in list   
                where (n.age > 17 || n.age < 2) && n.name != 'dntzhang'
                select n
            `)

    assert.deepEqual(result, [
        { "name": "qone", "age": 0 },
        { "name": "linq", "age": 1 },
        { "name": "linq", "age": 18 }])

})


QUnit.test("Query from prop", function (assert) {
    var data = {
        users: [
            { name: 'qone', age: 1 },
            { name: 'dntzhang', age: 17 },
            { name: 'dntzhang2', age: 27 }]
    }

    var result = qone({ data }).query(`
            from n in data.users        
            where n.age < 10
            select n
        `)

    assert.deepEqual(result, [{ "name": "qone", "age": 1 }])

})


QUnit.test("Multi datasource ", function (assert) {

    var listA = [
        { name: 'qone', age: 1 },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }]


    var listB = [
        { name: 'x', age: 11 },
        { name: 'xx', age: 12 },
        { name: 'xxx', age: 13 }
    ]


    var result = qone({ listA, listB }).query(`
            from a in listA     
            from b in listB      
            where a.age < 20 && b.age > 11
            select a, b
        `)

    assert.deepEqual(result, [
        [{ "name": "qone", "age": 1 }, { "name": "xx", "age": 12 }],
        [{ "name": "qone", "age": 1 }, { "name": "xxx", "age": 13 }],
        [{ "name": "linq", "age": 18 }, { "name": "xx", "age": 12 }],
        [{ "name": "linq", "age": 18 }, { "name": "xxx", "age": 13 }]])
})

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

QUnit.test("Bool condition ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }]

    var result = qone({ list }).query(`
            from a in list       
            where a.isBaby
            select a
        `)

    assert.deepEqual(result, [{ name: 'qone', age: 1, isBaby: true }])
})

QUnit.test("Bool condition ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: [true] },
        { name: 'linq', age: 18, isBaby: [false] },
        { name: 'dntzhang', age: 28, isBaby: [false] }]

    var result = qone({ list }).query(`
            from a in list       
            where a.isBaby[0]
            select a
        `)

    assert.deepEqual(result, [{ name: 'qone', age: 1, isBaby: [true] }])
})



QUnit.test("Multi from test ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true, colors: ['red', 'green', 'blue'] },
        { name: 'linq', age: 18, colors: ['red', 'blue'] },
        { name: 'dntzhang', age: 28, colors: ['red', 'blue'] }]

    var result = qone({ list }).query(`
            from a in list   
            from c in a.colors   
            where c = 'green'
            select a, c
        `)

    assert.deepEqual(result, [[{ "name": "qone", "age": 1, "isBaby": true, "colors": ["red", "green", "blue"] }, "green"]])
})




QUnit.test("Multi deep from test ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true, colors: [{ xx: [1, 2, 3] }, { xx: [11, 2, 3] }] },
        { name: 'linq', age: 18, colors: [{ xx: [100, 2, 3] }, { xx: [11, 2, 3] }] },
        { name: 'dntzhang', age: 28, colors: [{ xx: [1, 2, 3] }, { xx: [11, 2, 3] }] }]

    var result = qone({ list }).query(`
            from a in list   
            from c in a.colors   
            from d in c.xx  
            select a, c,d
        `)

    assert.equal(result.length, 18)
})


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

QUnit.test("Deep prop path test ", function (assert) {

    var list = [
        { name: 'qone', age: 1, fullName: { first: 'q', last: 'one' } },
        { name: 'linq', age: 18, fullName: { first: 'l', last: 'inq' } },
        { name: 'dntzhang', age: 28, fullName: { first: 'dnt', last: 'zhang' } }]

    var result = qone({ list }).query(`
            from a in list   
            where a.fullName.first === 'dnt'
            select a.name
        `)

    assert.deepEqual(result, ["dntzhang"])
})


QUnit.test("Method test 1", function (assert) {
    var arr = [1, 2, 3, 4, 5]

    qone('square', function (num) {
        return num * num
    })

    var result = qone({ arr }).query(`
      from n in arr   
      where  square(n) > 10
      select n
  `)

    assert.deepEqual(result, [4, 5])
})


QUnit.test("Method test 2", function (assert) {
    var arr = [1, 2, 3, 4, 5]

    qone('square', function (num) {
        return num * num
    })

    var result = qone({ arr }).query(`
      from n in arr   
      where  10 >  square(n)
      select n
  `)

    assert.deepEqual(result, [1, 2, 3])
})


QUnit.test("Method test 3", function (assert) {
    var arr = [1, 2, 3, 4, 5]

    qone('square', function (num) {
        return num * num
    })

    var result = qone({ arr }).query(`
      from n in arr   
      where  n > 3
      select square(n)
  `)

    assert.deepEqual(result, [16, 25])
})

QUnit.test("Method test 4", function (assert) {
    var arr = [1, 2, 3, 4, 5]

    qone('square', function (num) {
        return num * num
    })

    var result = qone({ arr }).query(`
      from n in arr   
      where  n > 3
      select n, square(n)
  `)

    assert.deepEqual(result, [[4, 16], [5, 25]])
})


QUnit.test("Method test 5", function (assert) {
    var arr = [1, 2, 3, 4, 5]

    qone('square', function (num) {
        return num * num
    })

    var result = qone({ arr }).query(`
      from n in arr   
      where  n > 3
      select { value : n, squareValue : square(n) }
  `)

    assert.deepEqual(result, [
        { "value": 4, "squareValue": 16 },
        { "value": 5, "squareValue": 25 }])
})

QUnit.test("Method test 6", function (assert) {
    var arr = [1, 2, 3, 4, 5]

    qone('square', function (num) {
        return num * num
    })

    var result = qone({ arr }).query(`
      from n in arr   
      where  n > 3
      select { squareValue : square(n) }
  `)

    assert.deepEqual(result, [{ "squareValue": 16 }, { "squareValue": 25 }])
})

QUnit.test("Method test 7", function (assert) {
    var arr = [1, 2, 3, 4, 5]

    qone('square', function (num) {
        return num * num
    })

    var result = qone({ arr }).query(`
      from n in arr   
      where  n > 3
      select { squareValue : square(n) }
  `)

    assert.deepEqual(result, [{ "squareValue": 16 }, { "squareValue": 25 }])
})

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

QUnit.test("Method test 9", function (assert) {
    var list = [
        { name: 'qone', age: 1 },
        { name: 'linq', age: 19 },
        { name: 'dntzhang', age: 28 }
    ]

    qone('greaterThan18', function (num) {
        return num > 18
    })

    var result = qone({ list }).query(`
                from n in list   
                where greaterThan18(n.age) && n.name = 'dntzhang'
                select n
            `)

    assert.deepEqual(result, [{ "name": "dntzhang", "age": 28 }])

})

QUnit.test("Method test 10", function (assert) {
    var list = [
        { name: 'qone', age: 1 },
        { name: 'linq', age: 19 },
        { name: 'dntzhang', age: 28 }
    ]

    qone('greaterThan18', function (num) {
        return num > 18
    })

    var result = qone({ list }).query(`
                from n in list   
                where greaterThan18(n.age) && n.name = 'dntzhang'
                select n
            `)

    assert.deepEqual(result, [{ "name": "dntzhang", "age": 28 }])

})

QUnit.test("Order by test 1", function (assert) {
    var list = [
        { name: 'linq2', age: 7 },
        { name: 'qone', age: 1 },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }
    ]

    var result = qone({ list }).query(`
                from n in list   
                where n.age > 0
                orderby n.age desc
                select n
            `)

    assert.deepEqual(result, [
        { "name": "dntzhang", "age": 28 },
        { "name": "linq", "age": 18 },
        { "name": "linq2", "age": 7 },
        { "name": "qone", "age": 1 }])

})

QUnit.test("Order by test 2", function (assert) {
    var list = [
        { name: 'linq2', age: 7 },
        { name: 'qone', age: 1 },
        { name: 'linq', age: 18 },
        { name: 'ainq', age: 18 },
        { name: 'dntzhang', age: 28 }
    ]

    var result = qone({ list }).query(`
                from n in list   
                where n.age > 0
                orderby n.age asc, n.name desc
                select n
            `)

    assert.deepEqual(result, [
        { "name": "qone", "age": 1 },
        { "name": "linq2", "age": 7 },
        { "name": "linq", "age": 18 },
        { "name": "ainq", "age": 18 },
        { "name": "dntzhang", "age": 28 }])

})



QUnit.test("Order by test 3", function (assert) {
    var list = [
        { name: 'qone', age: 17, age2: 2 },
        { name: 'linq', age: 18, age2: 1 },
        { name: 'dntzhang1', age: 28, age2: 2 },
        { name: 'dntzhang2', age: 28, age2: 1 },
        { name: 'dntzhang3', age: 29, age2: 1 }
    ]

    qone('sum', function (a, b) {
        return a + b
    })


    var result = qone({ list }).query(`
                  from n in list   
                  where n.age > 0
                  orderby sum(n.age,n.age2) 
                  select n
              `)

    assert.deepEqual(result, [
        { name: 'qone', age: 17, age2: 2 },
        { name: 'linq', age: 18, age2: 1 },
        { name: 'dntzhang2', age: 28, age2: 1 },
        { name: 'dntzhang1', age: 28, age2: 2 },
        { name: 'dntzhang3', age: 29, age2: 1 }])

})


QUnit.test("Order by test 4", function (assert) {
    var list = [
        { name: 'qone', age: 17, age2: 2 },
        { name: 'linq', age: 18, age2: 1 },
        { name: 'dntzhang1', age: 28, age2: 2 },
        { name: 'dntzhang2', age: 28, age2: 1 },
        { name: 'dntzhang3', age: 29, age2: 1 }
    ]

    qone('sum', function (a, b) {
        return a + b
    })


    var result = qone({ list }).query(`
                  from n in list   
                  where n.age > 0
                  orderby sum(n.age,n.age2) ,n.name
                  select n
              `)

    assert.deepEqual(result, [
        { name: 'linq', age: 18, age2: 1 },
        { name: 'qone', age: 17, age2: 2 },

        { name: 'dntzhang2', age: 28, age2: 1 },
        { name: 'dntzhang1', age: 28, age2: 2 },
        { name: 'dntzhang3', age: 29, age2: 1 }])

})

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

QUnit.test("Simple groupby test 2", function (assert) {
    var list = [
        { name: 'qone', age: 1 },
        { name: 'qone', age: 1 },
        { name: 'dntzhang', age: 28 },
        { name: 'dntzhang2', age: 28 },
        { name: 'dntzhang', age: 29 }
    ]

    var result = qone({ list }).query(`
                from n in list   
                where n.age > 0
                groupby n.age,n.name
            `)

    assert.deepEqual(result, [
        [{ "name": "qone", "age": 1 }, { "name": "qone", "age": 1 }],
        [{ "name": "dntzhang", "age": 28 }],
        [{ "name": "dntzhang2", "age": 28 }],
        [{ "name": "dntzhang", "age": 29 }]])

})

QUnit.test("Simple groupby with method", function (assert) {
    var list = [
        { name: 'qone', age: 17, age2: 2 },
        { name: 'linq', age: 18, age2: 1 },
        { name: 'dntzhang1', age: 28, age2: 1 },
        { name: 'dntzhang2', age: 28, age2: 1 },
        { name: 'dntzhang3', age: 29, age2: 1 }
    ]
    qone('sum', function (a, b) {
        return a + b
    })


    var result = qone({ list }).query(`
                from n in list   
                groupby sum(n.age,n.age2)
            `)

    assert.deepEqual(result, [
        [{ name: 'qone', age: 17, age2: 2 }, { name: 'linq', age: 18, age2: 1 }],
        [{ name: 'dntzhang1', age: 28, age2: 1 }, { name: 'dntzhang2', age: 28, age2: 1 }],
        [{ name: 'dntzhang3', age: 29, age2: 1 }]])

})


QUnit.test("Simple groupby with method", function (assert) {
    var list = [
        { name: 'qone', age: 17, age2: 2 },
        { name: 'qone', age: 18, age2: 1 },
        { name: 'dntzhang1', age: 28, age2: 1 },
        { name: 'dntzhang2', age: 28, age2: 1 },
        { name: 'dntzhang3', age: 29, age2: 1 }
    ]
    qone('sum', function (a, b) {
        return a + b
    })


    var result = qone({ list }).query(`
                from n in list   
                groupby sum(n.age,n.age2), n.name
            `)

    assert.deepEqual(result, [
        [{ name: 'qone', age: 17, age2: 2 }, { name: 'qone', age: 18, age2: 1 }],
        [{ name: 'dntzhang1', age: 28, age2: 1 }],
        [{ name: 'dntzhang2', age: 28, age2: 1 }],
        [{ name: 'dntzhang3', age: 29, age2: 1 }]])

})

QUnit.test("Bool condition 1 ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }]

    var result = qone({ list }).query(`
            from a in list       
            where !a.isBaby
            select a
        `)

    assert.deepEqual(result, [
        { "name": "linq", "age": 18 },
        { "name": "dntzhang", "age": 28 }])
})



QUnit.test("Bool condition 2 ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }]

    var result = qone({ list }).query(`
                from a in list       
                where !a.isBaby && a.name='qone'
                select a
            `)

    assert.deepEqual(result, [])
})


QUnit.test("Bool condition 3 ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }]

    var result = qone({ list }).query(`
            from a in list       
            where !(a.isBaby && a.name='qone') 
            select a
        `)


    assert.deepEqual(result, [{ name: 'linq', age: 18 }, { "name": "dntzhang", "age": 28 }])
})


QUnit.test("Bool condition 4 ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }]

    var result = qone({ list }).query(`
                from a in list       
                where !(a.isBaby && a.name='qone') && a.age = 28
                select a
            `)


    assert.deepEqual(result, [{ "name": "dntzhang", "age": 28 }])
})


QUnit.test("Bool condition 5 ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }]

    var result = qone({ list }).query(`
            from a in list       
            where a.isBaby = true
            select a
        `)

    assert.deepEqual(result, [{ name: 'qone', age: 1, isBaby: true }])
})



QUnit.test("Bool condition 6 ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }]

    var result = qone({ list }).query(`
            from a in list       
            where a.isBaby = true
            select a
        `)

    assert.deepEqual(result, [{ name: 'qone', age: 1, isBaby: true }])
})

QUnit.test("Bool condition 7 ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }]

    var result = qone({ list }).query(`
            from a in list       
            where a.isBaby = true
            select a
        `)

    assert.deepEqual(result, [
        { name: 'qone', age: 1, isBaby: true }])
})

QUnit.test("Bool condition 8 ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }]

    var result = qone({ list }).query(`
            from a in list       
            where a.isBaby = undefined
            select a
        `)

    assert.deepEqual(result, [
        { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }])
})

QUnit.test("Bool condition 9 ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18, isBaby: false },
        { name: 'dntzhang', age: 28, isBaby: false }]

    var result = qone({ list }).query(`
            from a in list       
            where a.isBaby = false
            select a
        `)

    assert.deepEqual(result, [
        { name: 'linq', age: 18, isBaby: false }, { name: 'dntzhang', age: 28, isBaby: false }])
})

QUnit.test("Bool condition 10 ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18, isBaby: false },
        { name: 'dntzhang', age: 28, isBaby: null }]

    var result = qone({ list }).query(`
            from a in list       
            where a.isBaby = false || a.isBaby = null
            select a
        `)

    assert.deepEqual(result, [
        { name: 'linq', age: 18, isBaby: false }, { name: 'dntzhang', age: 28, isBaby: null }])
})

QUnit.test("Bool condition 11 ", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }]

    var result = qone({ list }).query(`
                from a in list       
                where !((a.isBaby && a.name='qone') && a.age = 28)
                select a
            `)

    assert.deepEqual(result, [
        { "name": "qone", "age": 1, "isBaby": true },
        { "name": "linq", "age": 18 },
        { "name": "dntzhang", "age": 28 }])
})


QUnit.test("Bool condition 12", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }]

    var result = qone({ list }).query(`
                from a in list       
                where !((a.isBaby && a.name='qone') && ((a.age = 28)||!a.isBaby))
                select a
            `)

    assert.deepEqual(result, [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }])
})


QUnit.test("Bool condition 13", function (assert) {

    var list = [
        { name: 'qone', age: 1, isBaby: true },
        { name: 'linq', age: 18 },
        { name: 'dntzhang', age: 28 }]

    var result = qone({ list }).query(`
                from a in list       
                where ((a.isBaby && a.name='qone') && !((a.age = 28)||!a.isBaby))
                select a
            `)

    assert.deepEqual(result, [
        { name: 'qone', age: 1, isBaby: true }])
})


QUnit.test("Method test", function (assert) {

    var list = [
        { name: 'qone', age: 1, scores: [1, 2, 3] },
        { name: 'linq', age: 18, scores: [11, 2, 3] },
        { name: 'dntzhang', age: 28, scores: [100, 2, 3] }]

    qone('fullCredit', function (item) {
        return item[0] === 100
    })

    var result = qone({ list }).query(`
                    from a in list       
                    where fullCredit(a.scores)
                    select a
                `)

    assert.deepEqual(result, [
        { name: 'dntzhang', age: 28, scores: [100, 2, 3] }])
})


QUnit.test("Access array", function (assert) {

    var list = [
        { name: 'qone', age: 1, scores: [1, 2, 3] },
        { name: 'linq', age: 18, scores: [11, 2, 3] },
        { name: 'dntzhang', age: 28, scores: [100, 2, 3] }]


    var result = qone({ list }).query(`
                    from a in list       
                    where a.scores[0] === 100
                    select a
                `)

    assert.deepEqual(result, [
        { name: 'dntzhang', age: 28, scores: [100, 2, 3] }])
})

QUnit.test("Access array", function (assert) {

    var list = [
        { name: 'qone', age: 1, scores: [{ a: 1 }, 2, 3] },
        { name: 'linq', age: 18, scores: [{ a: 2 }, 2, 3] },
        { name: 'dntzhang', age: 28, scores: [{ a: 3 }, 2, 3] }]


    var result = qone({ list }).query(`
                    from a in list       
                    where a.scores[0].a === 3
                    select a
                `)

    assert.deepEqual(result, [
        { name: 'dntzhang', age: 28, scores: [{ a: 3 }, 2, 3] }])
})


QUnit.test("Access array", function (assert) {

    var list = [
        { name: 'qone', age: 1, scores: [[1, 2], 2, 3] },
        { name: 'linq', age: 18, scores: [[3, 4], 2, 3] },
        { name: 'dntzhang', age: 28, scores: [[5, 6], 2, 3] }]


    var result = qone({ list }).query(`
                    from a in list       
                    where a.scores[0][1] === 6
                    select a
                `)

    assert.deepEqual(result, [
        { name: 'dntzhang', age: 28, scores: [[5, 6], 2, 3] }])
})


QUnit.test("Method test", function (assert) {

    var list = [
        { name: 'qone', age: 1, scores: [1, 2, 3] },
        { name: 'linq', age: 18, scores: [11, 2, 3] },
        { name: 'dntzhang', age: 28, scores: [100, 2, 3] }]

    qone('fullCredit', function (item, x, y) {
        return item[0] * x + y === '22abc'
    })

    var result = qone({ list }).query(`
                    from a in list       
                    where fullCredit(a.scores, 2, "abc")
                    select a
                `)

    assert.deepEqual(result, [
        { name: 'linq', age: 18, scores: [11, 2, 3] }])
})


QUnit.test("Single line test", function (assert) {
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

    var result = qone({ list }).query('from n in list where n.age > 1 select n limit 1, 3')


    assert.deepEqual(result, [
        { name: 'dntzhang3', age: 3 },
        { name: 'dntzhang4', age: 4 },
        { name: 'dntzhang5', age: 5 }])

})


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


    assert.deepEqual(result, [{ name: 'dntzhang5', age: 5 },
    { name: 'dntzhang6', age: 6 },
    { name: 'dntzhang7', age: 7 },
    { name: 'dntzhang8', age: 8 }])

})


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




QUnit.test("Limit top 13", function (assert) {
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
                    limit 0, 13
                `)


    assert.deepEqual(result, [

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
    ])

})