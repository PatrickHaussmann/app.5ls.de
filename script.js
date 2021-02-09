function f(url, callback, type = "json", error_callback) {
    fetch(url)
        .then((response) => {
            if (response.ok) {
                return Promise.resolve(response);
            } else {
                return Promise.reject(new Error(response.statusText));
            }
        })
        .then((response) => {
            if (type == "json") {
                return response.json();
            } else if (type == "text") {
                return response.text();
            }
        })
        .then(callback)
        .catch((error) => {
            if (error_callback) {
                error_callback(error);
            } else {
                console.error("Request failed", error, url);
            }
        });
}

function mount(parent, childs) {
    if (childs.length) {
        childs.forEach((child) => {
            redom.mount(parent, child);
        });
    } else {
        redom.mount(parent, childs);
    }
}

var div_list_apps = document.getElementById("list-apps");
var div_list_conzept = document.getElementById("list-conzept");
var div_list_ideas = document.getElementById("list-ideas");

var custom_order = {
    apps: ["timer", "qr", "wetter", "corona", "doi", "wallpaper", "clock", "color"],
    conzept: ["copy", "editor", "calc", "todolist"],
};

var updates = [];

function create_item(repo) {
    let img_icon = redom.el("img.icon");
    let p_desc = redom.el("p.description");
    let p_link = redom.el("p.link");
    let a_github = redom.el(
        "a.github",
        { href: repo.html_url },
        redom.el("img.github", { src: "/github.svg" })
    );
    let a_link = redom.el("a.link", [
        img_icon,
        redom.el("div.container", [redom.el("h1.name", repo.name), p_desc]),
        redom.el("div.bottom", [a_github, p_link]),
    ]);

    el = redom.el("div.item", a_link);

    img_icon.src =
        "https://cdn.jsdelivr.net/gh/" + repo.full_name + "@latest/icon.svg";

    if (repo.homepage) {
        a_link.href = repo.homepage;
    } else {
        a_link.href = repo.html_url;
    }
    a_link.alt = repo.name + "-icon";
    p_link.innerText = a_link.href.replace("https://", "").replace(/\/$/g, ""); // remove trailing slash

    p_desc.innerText = repo.description;

    return el;
}

f("https://api.github.com/orgs/app-5ls-de/repos", (data) => {
    document.getElementById("spinner").style.display = "None";

    sorted = data.sort(function (a, b) {
        if (a.homepage && !b.homepage) return -1;
        if (!a.homepage && b.homepage) return 1;

        return b.updated_at.localeCompare(a.updated_at);
    });

    data.forEach((repo) => {
        if (repo.archived || repo.disabled || repo.private || !repo.description)
            return;

        if (custom_order.apps.includes(repo.name)) {
            mount(div_list_apps, create_item(repo));
        } else if (custom_order.conzept.includes(repo.name)) {
            mount(div_list_conzept, create_item(repo));
        } else {
            mount(div_list_ideas, create_item(repo));
        }

        //mount(div_list, redom.el("hr"));
        //console.log(repo.updated_at);
        //updates.push(repo.updated_at)
    });
});
