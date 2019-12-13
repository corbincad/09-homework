const inquirer = require("inquirer");
const axios = require("axios");
const HTML5ToPDF = require('html5-to-pdf')
const path = require("path")
const util = require("util")
const fs = require("fs")
const writeFileAsync = util.promisify(fs.writeFile)


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
            },
            {
                message: "Pick a background color?",
                name: 'color',
            }
        ]).then(answers => {
            this.githubUserName = answers.githubUserName;
            this.color = answers.color;
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

    async createHtml() {
        await writeFileAsync("profile.html",`
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <link rel="stylesheet" href="profileGenerator.css">
    <html>
    <body style="background-color: ${this.color}">
    
    <div class="jumbotron">

        <img id="profileImage" src='${this.avatar_url}'>

        <h1>${this.name} | ${this.location}</h1>
        
    </div>

    <div>${this.bio}</div>
   
    <div class="card-deck">

    <div class="card">
      <div class="card-body">
        <h5 class="card-title">REPOS</h5>
        <p class="card-text">${this.public_repos}</p>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Followers</h5>
        <p class="card-text">${this.followers}</p>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Following</h5>
        <p class="card-text">${this.following}</p>
      </div>
    </div>
    </div>
    </body>
    </html>
    `) ;
        console.log(this);
        await this.createPdf();
    }

    async createPdf() {
        const html5ToPDF = new HTML5ToPDF({
            inputPath: path.join("./", "profile.html"),
            outputPath: path.join("./", "profile.pdf"),
            templatePath: path.join("./", "templates", "htmlbootstrap"),
            include: [
              path.join("./", "profileGenerator.css"),
            ],
            options: {
                printBackground: true,
            }
          })
         
          await html5ToPDF.start()
          await html5ToPDF.build()
          await html5ToPDF.close()
          console.log("DONE")
          process.exit(0)
        }
}



var newHomework = new DoMyHomework();
newHomework.promptUser();

