import 'bootstrap';
import 'bootstrap/css/bootstrap.css!';
export class App {
    configureRouter(config, router) {
        this.router = router;
        config.title = 'Aurelia';
        config.map([
            { route: ['', 'welcome'], moduleId: './welcome', nav: true, title: 'Welcome' },
            { route: 'flickr', moduleId: './flickr', nav: true },
            { route: 'child-router', moduleId: './child-router', nav: true, title: 'Child Router' }
        ]);
    }
}