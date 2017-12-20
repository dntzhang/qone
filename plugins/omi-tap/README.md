## omi-tap

Support tap event in your [Omi](https://github.com/AlloyTeam/omix) project.

---

## Demo

[https://alloyteam.github.io/omix/plugins/omi-tap/example/](https://alloyteam.github.io/omix/plugins/omi-tap/example/)

## install

``` js
npm install omi-tap
```

## 使用

```js
import 'omi-tap';

class App extends Component {
    tapHandler(evt) {
        alert('Hello Omi + Parcel!')
    }

    render() {
        return (
            <div>
                <h1 omi-tap tap={this.tapHandler}>Hello Omi + Parcel 📦 🚀</h1>
            </div>
        )
    }
}

Omi.render(new App(),"#container");
```

# License
This content is released under the [MIT](http://opensource.org/licenses/MIT) License.
