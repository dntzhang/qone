"use strict";

QUnit.test("Basic test", function (assert) {
    var arr = [1, 2, 3, 4, 5];

    var result = qone({ arr: arr }).query("\n        from n in arr   \n        where n > 3\n        select n\n    ");

    assert.deepEqual(result, [4, 5]);
});

QUnit.test("Query json array", function (assert) {
    var list = [{ name: 'qone', age: 1 }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from n in list   \n                where n.age > 18\n                select n\n            ");

    assert.deepEqual(result, [{ "name": "dntzhang", "age": 28 }]);
});

QUnit.test("Multi conditional query", function (assert) {
    var list = [{ name: 'qone', age: 1 }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from n in list   \n                where n.age > 10 && n.name = 'linq'\n                select n\n            ");

    assert.deepEqual(result, [{ "name": "linq", "age": 18 }]);
});

QUnit.test("Select test", function (assert) {
    var list = [{ name: 'qone', age: 1 }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from n in list   \n                where n.age < 20\n                select n.age, n.name\n            ");

    assert.deepEqual(result, [[1, "qone"], [18, "linq"]]);
});

QUnit.test("Select JSON test", function (assert) {
    var list = [{ name: 'qone', age: 1 }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from n in list   \n                where n.age < 20\n                select {n.age, n.name}\n            ");

    assert.deepEqual(result, [{ "age": 1, "name": "qone" }, { "age": 18, "name": "linq" }]);
});

QUnit.test("Select full JSON test", function (assert) {
    var list = [{ name: 'qone', age: 1 }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from n in list   \n                where n.age < 20\n                select {a : n.age, b : n.name}\n            ");

    assert.deepEqual(result, [{ "a": 1, "b": "qone" }, { "a": 18, "b": "linq" }]);
});

QUnit.test("|| conditional test", function (assert) {
    var list = [{ name: 'qone', age: 1 }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from n in list   \n                where n.age > 19 ||  n.age < 2\n                select n\n            ");

    assert.deepEqual(result, [{ "name": "qone", "age": 1 }, { "name": "dntzhang", "age": 28 }]);
});

QUnit.test("|| and && conditional test", function (assert) {
    var list = [{ name: 'qone', age: 0 }, { name: 'linq', age: 1 }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from n in list   \n                where n.age > 17 || n.age < 2 && n.name != 'dntzhang'\n                select n\n            ");

    assert.deepEqual(result, [{ "name": "qone", "age": 0 }, { "name": "linq", "age": 1 }, { "name": "linq", "age": 18 }, { "name": "dntzhang", "age": 28 }]);
});

QUnit.test("(), || and && conditional test", function (assert) {
    var list = [{ name: 'qone', age: 0 }, { name: 'linq', age: 1 }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from n in list   \n                where (n.age > 17 || n.age < 2) && n.name != 'dntzhang'\n                select n\n            ");

    assert.deepEqual(result, [{ "name": "qone", "age": 0 }, { "name": "linq", "age": 1 }, { "name": "linq", "age": 18 }]);
});

QUnit.test("Query from prop", function (assert) {
    var data = {
        users: [{ name: 'qone', age: 1 }, { name: 'dntzhang', age: 17 }, { name: 'dntzhang2', age: 27 }]
    };

    var result = qone({ data: data }).query("\n            from n in data.users        \n            where n.age < 10\n            select n\n        ");

    assert.deepEqual(result, [{ "name": "qone", "age": 1 }]);
});

QUnit.test("Multi datasource ", function (assert) {

    var listA = [{ name: 'qone', age: 1 }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var listB = [{ name: 'x', age: 11 }, { name: 'xx', age: 12 }, { name: 'xxx', age: 13 }];

    var result = qone({ listA: listA, listB: listB }).query("\n            from a in listA     \n            from b in listB      \n            where a.age < 20 && b.age > 11\n            select a, b\n        ");

    assert.deepEqual(result, [[{ "name": "qone", "age": 1 }, { "name": "xx", "age": 12 }], [{ "name": "qone", "age": 1 }, { "name": "xxx", "age": 13 }], [{ "name": "linq", "age": 18 }, { "name": "xx", "age": 12 }], [{ "name": "linq", "age": 18 }, { "name": "xxx", "age": 13 }]]);
});

QUnit.test("Multi datasource with props condition", function (assert) {

    var listA = [{ name: 'qone', age: 1 }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var listB = [{ name: 'x', age: 11 }, { name: 'xx', age: 18 }, { name: 'xxx', age: 13 }];

    var result = qone({ listA: listA, listB: listB }).query("\n            from a in listA     \n            from b in listB      \n            where a.age = b.age\n            select a, b\n        ");

    assert.deepEqual(result, [[{ "name": "linq", "age": 18 }, { "name": "xx", "age": 18 }]]);
});

QUnit.test("Bool condition ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n            from a in list       \n            where a.isBaby\n            select a\n        ");

    assert.deepEqual(result, [{ name: 'qone', age: 1, isBaby: true }]);
});

QUnit.test("Bool condition ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: [true] }, { name: 'linq', age: 18, isBaby: [false] }, { name: 'dntzhang', age: 28, isBaby: [false] }];

    var result = qone({ list: list }).query("\n            from a in list       \n            where a.isBaby[0]\n            select a\n        ");

    assert.deepEqual(result, [{ name: 'qone', age: 1, isBaby: [true] }]);
});

QUnit.test("Multi from test ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true, colors: ['red', 'green', 'blue'] }, { name: 'linq', age: 18, colors: ['red', 'blue'] }, { name: 'dntzhang', age: 28, colors: ['red', 'blue'] }];

    var result = qone({ list: list }).query("\n            from a in list   \n            from c in a.colors   \n            where c = 'green'\n            select a, c\n        ");

    assert.deepEqual(result, [[{ "name": "qone", "age": 1, "isBaby": true, "colors": ["red", "green", "blue"] }, "green"]]);
});

QUnit.test("Multi deep from test ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true, colors: [{ xx: [1, 2, 3] }, { xx: [11, 2, 3] }] }, { name: 'linq', age: 18, colors: [{ xx: [100, 2, 3] }, { xx: [11, 2, 3] }] }, { name: 'dntzhang', age: 28, colors: [{ xx: [1, 2, 3] }, { xx: [11, 2, 3] }] }];

    var result = qone({ list: list }).query("\n            from a in list   \n            from c in a.colors   \n            from d in c.xx  \n            select a, c,d\n        ");

    assert.equal(result.length, 18);
});

QUnit.test("Multi deep from test ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true, colors: [{ xx: [1, 2, 3] }, { xx: [11, 2, 3] }] }, { name: 'linq', age: 18, colors: [{ xx: [100, 2, 3] }, { xx: [11, 2, 3] }] }, { name: 'dntzhang', age: 28, colors: [{ xx: [1, 2, 3] }, { xx: [11, 2, 3] }] }];

    var result = qone({ list: list }).query("\n            from a in list   \n            from c in a.colors   \n            from d in c.xx  \n            where d === 100\n            select a.name, c,d\n        ");

    assert.deepEqual(result, [["linq", { "xx": [100, 2, 3] }, 100]]);
});

QUnit.test("Deep prop path test ", function (assert) {

    var list = [{ name: 'qone', age: 1, fullName: { first: 'q', last: 'one' } }, { name: 'linq', age: 18, fullName: { first: 'l', last: 'inq' } }, { name: 'dntzhang', age: 28, fullName: { first: 'dnt', last: 'zhang' } }];

    var result = qone({ list: list }).query("\n            from a in list   \n            where a.fullName.first === 'dnt'\n            select a.name\n        ");

    assert.deepEqual(result, ["dntzhang"]);
});

QUnit.test("Method test 1", function (assert) {
    var arr = [1, 2, 3, 4, 5];

    qone('square', function (num) {
        return num * num;
    });

    var result = qone({ arr: arr }).query("\n      from n in arr   \n      where  square(n) > 10\n      select n\n  ");

    assert.deepEqual(result, [4, 5]);
});

QUnit.test("Method test 2", function (assert) {
    var arr = [1, 2, 3, 4, 5];

    qone('square', function (num) {
        return num * num;
    });

    var result = qone({ arr: arr }).query("\n      from n in arr   \n      where  10 >  square(n)\n      select n\n  ");

    assert.deepEqual(result, [1, 2, 3]);
});

QUnit.test("Method test 3", function (assert) {
    var arr = [1, 2, 3, 4, 5];

    qone('square', function (num) {
        return num * num;
    });

    var result = qone({ arr: arr }).query("\n      from n in arr   \n      where  n > 3\n      select square(n)\n  ");

    assert.deepEqual(result, [16, 25]);
});

QUnit.test("Method test 4", function (assert) {
    var arr = [1, 2, 3, 4, 5];

    qone('square', function (num) {
        return num * num;
    });

    var result = qone({ arr: arr }).query("\n      from n in arr   \n      where  n > 3\n      select n, square(n)\n  ");

    assert.deepEqual(result, [[4, 16], [5, 25]]);
});

QUnit.test("Method test 5", function (assert) {
    var arr = [1, 2, 3, 4, 5];

    qone('square', function (num) {
        return num * num;
    });

    var result = qone({ arr: arr }).query("\n      from n in arr   \n      where  n > 3\n      select { value : n, squareValue : square(n) }\n  ");

    assert.deepEqual(result, [{ "value": 4, "squareValue": 16 }, { "value": 5, "squareValue": 25 }]);
});

QUnit.test("Method test 6", function (assert) {
    var arr = [1, 2, 3, 4, 5];

    qone('square', function (num) {
        return num * num;
    });

    var result = qone({ arr: arr }).query("\n      from n in arr   \n      where  n > 3\n      select { squareValue : square(n) }\n  ");

    assert.deepEqual(result, [{ "squareValue": 16 }, { "squareValue": 25 }]);
});

QUnit.test("Method test 7", function (assert) {
    var arr = [1, 2, 3, 4, 5];

    qone('square', function (num) {
        return num * num;
    });

    var result = qone({ arr: arr }).query("\n      from n in arr   \n      where  n > 3\n      select { squareValue : square(n) }\n  ");

    assert.deepEqual(result, [{ "squareValue": 16 }, { "squareValue": 25 }]);
});

QUnit.test("Method test 8", function (assert) {
    var arr = [1, 2, 3, 4, 5];

    qone('square', function (num) {
        return num * num;
    });

    qone('sqrt', function (num) {
        return Math.sqrt(num);
    });

    var result = qone({ arr: arr }).query("\n      from n in arr   \n      where  sqrt(n) >= 2 \n      select { squareValue : square(n) }\n  ");

    assert.deepEqual(result, [{ "squareValue": 16 }, { "squareValue": 25 }]);
});

QUnit.test("Method test 9", function (assert) {
    var list = [{ name: 'qone', age: 1 }, { name: 'linq', age: 19 }, { name: 'dntzhang', age: 28 }];

    qone('greaterThan18', function (num) {
        return num > 18;
    });

    var result = qone({ list: list }).query("\n                from n in list   \n                where greaterThan18(n.age) && n.name = 'dntzhang'\n                select n\n            ");

    assert.deepEqual(result, [{ "name": "dntzhang", "age": 28 }]);
});

QUnit.test("Method test 10", function (assert) {
    var list = [{ name: 'qone', age: 1 }, { name: 'linq', age: 19 }, { name: 'dntzhang', age: 28 }];

    qone('greaterThan18', function (num) {
        return num > 18;
    });

    var result = qone({ list: list }).query("\n                from n in list   \n                where greaterThan18(n.age) && n.name = 'dntzhang'\n                select n\n            ");

    assert.deepEqual(result, [{ "name": "dntzhang", "age": 28 }]);
});

QUnit.test("Order by test 1", function (assert) {
    var list = [{ name: 'linq2', age: 7 }, { name: 'qone', age: 1 }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from n in list   \n                where n.age > 0\n                orderby n.age desc\n                select n\n            ");

    assert.deepEqual(result, [{ "name": "dntzhang", "age": 28 }, { "name": "linq", "age": 18 }, { "name": "linq2", "age": 7 }, { "name": "qone", "age": 1 }]);
});

QUnit.test("Order by test 2", function (assert) {
    var list = [{ name: 'linq2', age: 7 }, { name: 'qone', age: 1 }, { name: 'linq', age: 18 }, { name: 'ainq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from n in list   \n                where n.age > 0\n                orderby n.age asc, n.name desc\n                select n\n            ");

    assert.deepEqual(result, [{ "name": "qone", "age": 1 }, { "name": "linq2", "age": 7 }, { "name": "linq", "age": 18 }, { "name": "ainq", "age": 18 }, { "name": "dntzhang", "age": 28 }]);
});

QUnit.test("Order by test 3", function (assert) {
    var list = [{ name: 'qone', age: 17, age2: 2 }, { name: 'linq', age: 18, age2: 1 }, { name: 'dntzhang1', age: 28, age2: 2 }, { name: 'dntzhang2', age: 28, age2: 1 }, { name: 'dntzhang3', age: 29, age2: 1 }];

    qone('sum', function (a, b) {
        return a + b;
    });

    var result = qone({ list: list }).query("\n                  from n in list   \n                  where n.age > 0\n                  orderby sum(n.age,n.age2) \n                  select n\n              ");

    assert.deepEqual(result, [{ name: 'qone', age: 17, age2: 2 }, { name: 'linq', age: 18, age2: 1 }, { name: 'dntzhang2', age: 28, age2: 1 }, { name: 'dntzhang1', age: 28, age2: 2 }, { name: 'dntzhang3', age: 29, age2: 1 }]);
});

QUnit.test("Order by test 4", function (assert) {
    var list = [{ name: 'qone', age: 17, age2: 2 }, { name: 'linq', age: 18, age2: 1 }, { name: 'dntzhang1', age: 28, age2: 2 }, { name: 'dntzhang2', age: 28, age2: 1 }, { name: 'dntzhang3', age: 29, age2: 1 }];

    qone('sum', function (a, b) {
        return a + b;
    });

    var result = qone({ list: list }).query("\n                  from n in list   \n                  where n.age > 0\n                  orderby sum(n.age,n.age2) ,n.name\n                  select n\n              ");

    assert.deepEqual(result, [{ name: 'linq', age: 18, age2: 1 }, { name: 'qone', age: 17, age2: 2 }, { name: 'dntzhang2', age: 28, age2: 1 }, { name: 'dntzhang1', age: 28, age2: 2 }, { name: 'dntzhang3', age: 29, age2: 1 }]);
});

QUnit.test("Simple groupby test 1", function (assert) {
    var list = [{ name: 'qone', age: 1 }, { name: 'linq', age: 18 }, { name: 'dntzhang1', age: 28 }, { name: 'dntzhang2', age: 28 }, { name: 'dntzhang3', age: 29 }];

    var result = qone({ list: list }).query("\n                from n in list   \n                where n.age > 18\n                groupby n.age\n            ");

    assert.deepEqual(result, [[{ "name": "dntzhang1", "age": 28 }, { "name": "dntzhang2", "age": 28 }], [{ "name": "dntzhang3", "age": 29 }]]);
});

QUnit.test("Simple groupby test 2", function (assert) {
    var list = [{ name: 'qone', age: 1 }, { name: 'qone', age: 1 }, { name: 'dntzhang', age: 28 }, { name: 'dntzhang2', age: 28 }, { name: 'dntzhang', age: 29 }];

    var result = qone({ list: list }).query("\n                from n in list   \n                where n.age > 0\n                groupby n.age,n.name\n            ");

    assert.deepEqual(result, [[{ "name": "qone", "age": 1 }, { "name": "qone", "age": 1 }], [{ "name": "dntzhang", "age": 28 }], [{ "name": "dntzhang2", "age": 28 }], [{ "name": "dntzhang", "age": 29 }]]);
});

QUnit.test("Simple groupby with method", function (assert) {
    var list = [{ name: 'qone', age: 17, age2: 2 }, { name: 'linq', age: 18, age2: 1 }, { name: 'dntzhang1', age: 28, age2: 1 }, { name: 'dntzhang2', age: 28, age2: 1 }, { name: 'dntzhang3', age: 29, age2: 1 }];
    qone('sum', function (a, b) {
        return a + b;
    });

    var result = qone({ list: list }).query("\n                from n in list   \n                groupby sum(n.age,n.age2)\n            ");

    assert.deepEqual(result, [[{ name: 'qone', age: 17, age2: 2 }, { name: 'linq', age: 18, age2: 1 }], [{ name: 'dntzhang1', age: 28, age2: 1 }, { name: 'dntzhang2', age: 28, age2: 1 }], [{ name: 'dntzhang3', age: 29, age2: 1 }]]);
});

QUnit.test("Simple groupby with method", function (assert) {
    var list = [{ name: 'qone', age: 17, age2: 2 }, { name: 'qone', age: 18, age2: 1 }, { name: 'dntzhang1', age: 28, age2: 1 }, { name: 'dntzhang2', age: 28, age2: 1 }, { name: 'dntzhang3', age: 29, age2: 1 }];
    qone('sum', function (a, b) {
        return a + b;
    });

    var result = qone({ list: list }).query("\n                from n in list   \n                groupby sum(n.age,n.age2), n.name\n            ");

    assert.deepEqual(result, [[{ name: 'qone', age: 17, age2: 2 }, { name: 'qone', age: 18, age2: 1 }], [{ name: 'dntzhang1', age: 28, age2: 1 }], [{ name: 'dntzhang2', age: 28, age2: 1 }], [{ name: 'dntzhang3', age: 29, age2: 1 }]]);
});

QUnit.test("Bool condition 1 ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n            from a in list       \n            where !a.isBaby\n            select a\n        ");

    assert.deepEqual(result, [{ "name": "linq", "age": 18 }, { "name": "dntzhang", "age": 28 }]);
});

QUnit.test("Bool condition 2 ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from a in list       \n                where !a.isBaby && a.name='qone'\n                select a\n            ");

    assert.deepEqual(result, []);
});

QUnit.test("Bool condition 3 ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n            from a in list       \n            where !(a.isBaby && a.name='qone') \n            select a\n        ");

    assert.deepEqual(result, [{ name: 'linq', age: 18 }, { "name": "dntzhang", "age": 28 }]);
});

QUnit.test("Bool condition 4 ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from a in list       \n                where !(a.isBaby && a.name='qone') && a.age = 28\n                select a\n            ");

    assert.deepEqual(result, [{ "name": "dntzhang", "age": 28 }]);
});

QUnit.test("Bool condition 5 ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n            from a in list       \n            where a.isBaby = true\n            select a\n        ");

    assert.deepEqual(result, [{ name: 'qone', age: 1, isBaby: true }]);
});

QUnit.test("Bool condition 6 ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n            from a in list       \n            where a.isBaby = true\n            select a\n        ");

    assert.deepEqual(result, [{ name: 'qone', age: 1, isBaby: true }]);
});

QUnit.test("Bool condition 7 ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n            from a in list       \n            where a.isBaby = true\n            select a\n        ");

    assert.deepEqual(result, [{ name: 'qone', age: 1, isBaby: true }]);
});

QUnit.test("Bool condition 8 ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n            from a in list       \n            where a.isBaby = undefined\n            select a\n        ");

    assert.deepEqual(result, [{ name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }]);
});

QUnit.test("Bool condition 9 ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18, isBaby: false }, { name: 'dntzhang', age: 28, isBaby: false }];

    var result = qone({ list: list }).query("\n            from a in list       \n            where a.isBaby = false\n            select a\n        ");

    assert.deepEqual(result, [{ name: 'linq', age: 18, isBaby: false }, { name: 'dntzhang', age: 28, isBaby: false }]);
});

QUnit.test("Bool condition 10 ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18, isBaby: false }, { name: 'dntzhang', age: 28, isBaby: null }];

    var result = qone({ list: list }).query("\n            from a in list       \n            where a.isBaby = false || a.isBaby = null\n            select a\n        ");

    assert.deepEqual(result, [{ name: 'linq', age: 18, isBaby: false }, { name: 'dntzhang', age: 28, isBaby: null }]);
});

QUnit.test("Bool condition 11 ", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from a in list       \n                where !((a.isBaby && a.name='qone') && a.age = 28)\n                select a\n            ");

    assert.deepEqual(result, [{ "name": "qone", "age": 1, "isBaby": true }, { "name": "linq", "age": 18 }, { "name": "dntzhang", "age": 28 }]);
});

QUnit.test("Bool condition 12", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from a in list       \n                where !((a.isBaby && a.name='qone') && ((a.age = 28)||!a.isBaby))\n                select a\n            ");

    assert.deepEqual(result, [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }]);
});

QUnit.test("Bool condition 13", function (assert) {

    var list = [{ name: 'qone', age: 1, isBaby: true }, { name: 'linq', age: 18 }, { name: 'dntzhang', age: 28 }];

    var result = qone({ list: list }).query("\n                from a in list       \n                where ((a.isBaby && a.name='qone') && !((a.age = 28)||!a.isBaby))\n                select a\n            ");

    assert.deepEqual(result, [{ name: 'qone', age: 1, isBaby: true }]);
});

QUnit.test("Method test", function (assert) {

    var list = [{ name: 'qone', age: 1, scores: [1, 2, 3] }, { name: 'linq', age: 18, scores: [11, 2, 3] }, { name: 'dntzhang', age: 28, scores: [100, 2, 3] }];

    qone('fullCredit', function (item) {
        return item[0] === 100;
    });

    var result = qone({ list: list }).query("\n                    from a in list       \n                    where fullCredit(a.scores)\n                    select a\n                ");

    assert.deepEqual(result, [{ name: 'dntzhang', age: 28, scores: [100, 2, 3] }]);
});

QUnit.test("Access array", function (assert) {

    var list = [{ name: 'qone', age: 1, scores: [1, 2, 3] }, { name: 'linq', age: 18, scores: [11, 2, 3] }, { name: 'dntzhang', age: 28, scores: [100, 2, 3] }];

    var result = qone({ list: list }).query("\n                    from a in list       \n                    where a.scores[0] === 100\n                    select a\n                ");

    assert.deepEqual(result, [{ name: 'dntzhang', age: 28, scores: [100, 2, 3] }]);
});

QUnit.test("Access array", function (assert) {

    var list = [{ name: 'qone', age: 1, scores: [{ a: 1 }, 2, 3] }, { name: 'linq', age: 18, scores: [{ a: 2 }, 2, 3] }, { name: 'dntzhang', age: 28, scores: [{ a: 3 }, 2, 3] }];

    var result = qone({ list: list }).query("\n                    from a in list       \n                    where a.scores[0].a === 3\n                    select a\n                ");

    assert.deepEqual(result, [{ name: 'dntzhang', age: 28, scores: [{ a: 3 }, 2, 3] }]);
});

QUnit.test("Access array", function (assert) {

    var list = [{ name: 'qone', age: 1, scores: [[1, 2], 2, 3] }, { name: 'linq', age: 18, scores: [[3, 4], 2, 3] }, { name: 'dntzhang', age: 28, scores: [[5, 6], 2, 3] }];

    var result = qone({ list: list }).query("\n                    from a in list       \n                    where a.scores[0][1] === 6\n                    select a\n                ");

    assert.deepEqual(result, [{ name: 'dntzhang', age: 28, scores: [[5, 6], 2, 3] }]);
});

QUnit.test("Method test", function (assert) {

    var list = [{ name: 'qone', age: 1, scores: [1, 2, 3] }, { name: 'linq', age: 18, scores: [11, 2, 3] }, { name: 'dntzhang', age: 28, scores: [100, 2, 3] }];

    qone('fullCredit', function (item, x, y) {
        return item[0] * x + y === '22abc';
    });

    var result = qone({ list: list }).query("\n                    from a in list       \n                    where fullCredit(a.scores, 2, \"abc\")\n                    select a\n                ");

    assert.deepEqual(result, [{ name: 'linq', age: 18, scores: [11, 2, 3] }]);
});

QUnit.test("Single line test", function (assert) {
    var list = [{ name: 'dntzhang1', age: 1 }, { name: 'dntzhang2', age: 2 }, { name: 'dntzhang3', age: 3 }, { name: 'dntzhang4', age: 4 }, { name: 'dntzhang5', age: 5 }, { name: 'dntzhang6', age: 6 }, { name: 'dntzhang7', age: 7 }, { name: 'dntzhang8', age: 8 }, { name: 'dntzhang9', age: 9 }, { name: 'dntzhang10', age: 10 }];

    var result = qone({ list: list }).query('from n in list where n.age > 1 select n limit 1, 3');

    assert.deepEqual(result, [{ name: 'dntzhang3', age: 3 }, { name: 'dntzhang4', age: 4 }, { name: 'dntzhang5', age: 5 }]);
});

QUnit.test("Limit one page test", function (assert) {
    var list = [{ name: 'dntzhang1', age: 1 }, { name: 'dntzhang2', age: 2 }, { name: 'dntzhang3', age: 3 }, { name: 'dntzhang4', age: 4 }, { name: 'dntzhang5', age: 5 }, { name: 'dntzhang6', age: 6 }, { name: 'dntzhang7', age: 7 }, { name: 'dntzhang8', age: 8 }, { name: 'dntzhang9', age: 9 }, { name: 'dntzhang10', age: 10 }];

    var pageIndex = 1,
        pageSize = 4;
    var result = qone({ list: list }).query("\n                    from n in list   \n                    where n.age > 0\n                    select n\n                    limit " + pageIndex * pageSize + ", " + pageSize + "\n                ");

    assert.deepEqual(result, [{ name: 'dntzhang5', age: 5 }, { name: 'dntzhang6', age: 6 }, { name: 'dntzhang7', age: 7 }, { name: 'dntzhang8', age: 8 }]);
});

QUnit.test("Limit top 3", function (assert) {
    var list = [{ name: 'dntzhang1', age: 1 }, { name: 'dntzhang2', age: 2 }, { name: 'dntzhang3', age: 3 }, { name: 'dntzhang4', age: 4 }, { name: 'dntzhang5', age: 5 }, { name: 'dntzhang6', age: 6 }, { name: 'dntzhang7', age: 7 }, { name: 'dntzhang8', age: 8 }, { name: 'dntzhang9', age: 9 }, { name: 'dntzhang10', age: 10 }];

    var pageIndex = 1,
        pageSize = 4;
    var result = qone({ list: list }).query("\n                    from n in list   \n                    select n\n                    limit 0, 3\n                ");

    assert.deepEqual(result, [{ name: 'dntzhang1', age: 1 }, { name: 'dntzhang2', age: 2 }, { name: 'dntzhang3', age: 3 }]);
});

QUnit.test("Limit top 13", function (assert) {
    var list = [{ name: 'dntzhang1', age: 1 }, { name: 'dntzhang2', age: 2 }, { name: 'dntzhang3', age: 3 }, { name: 'dntzhang4', age: 4 }, { name: 'dntzhang5', age: 5 }, { name: 'dntzhang6', age: 6 }, { name: 'dntzhang7', age: 7 }, { name: 'dntzhang8', age: 8 }, { name: 'dntzhang9', age: 9 }, { name: 'dntzhang10', age: 10 }];

    var pageIndex = 1,
        pageSize = 4;
    var result = qone({ list: list }).query("\n                    from n in list   \n                    select n\n                    limit 0, 13\n                ");

    assert.deepEqual(result, [{ name: 'dntzhang1', age: 1 }, { name: 'dntzhang2', age: 2 }, { name: 'dntzhang3', age: 3 }, { name: 'dntzhang4', age: 4 }, { name: 'dntzhang5', age: 5 }, { name: 'dntzhang6', age: 6 }, { name: 'dntzhang7', age: 7 }, { name: 'dntzhang8', age: 8 }, { name: 'dntzhang9', age: 9 }, { name: 'dntzhang10', age: 10 }]);
});