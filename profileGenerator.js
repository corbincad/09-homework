const inquirer = require("inquirer");
const axios = require("axios");
const pdf = require('html-pdf');

class DoMyHomework {
    constructor() {
        this.githubUserName = null;
        this.color = null;
    }

    promptUser() {
        return inquirer.prompt([
            {
                message: 'What is your user name',
                name: 'githubUserName'
            }
        ]).then(({ githubUserName }) => {
            this.githubUserName = githubUserName;
            this.makeApiRequest();
        })
    }

    makeApiRequest() {
        return Promise.all(
            [
                axios.get(`https://api.github.com/users/${this.githubUserName}`),
                axios.get(`https://api.github.com/users/${this.githubUserName}/starred`)
            ])
            .then((
                [
                    {
                        data:
                        {
                            avatar_url,
                            location,
                            name,
                            blog,
                            bio,
                            public_repos,
                            followers,
                            following
                        }
                    },
                    {
                        data:
                        {
                            length
                        }
                    }
                ]
            ) => {

                this.avatar_url = avatar_url;
                this.location = location;
                this.name = name;
                this.blog = blog;
                this.bio = bio;
                this.public_repos = public_repos;
                this.followers = followers;
                this.following = following;
                this.stars = length;
                console.log(this);
                this.createHtml();
            })
    }

    createHtml() {
        this.html = `
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <link rel="stylesheet" href="profileGenerator.css">
    <html>
    <body>
    <div class="jumbotron">
        <h1>name: ${this.name}</h1>
        <img id="profileImage" src='${this.avatar_url}'>
    </div>
    <div>bio: ${this.bio}</div>
    <div>city: ${this.location}</div>
    <div>repos: ${this.public_repos}</div>
    <div>followers: ${this.followers}</div>
    <div>following: ${this.following}</div>
    </body>
    </html>
    `;
        console.log(this);
        this.createPdf();
    }

    createPdf() {
        pdf.create(this.html).toFile('./class-test.pdf', function (err, res) {
            if (err) return console.log(err);
            console.log(res);
        });
    }

}

var newHomework = new DoMyHomework();
newHomework.promptUser();
