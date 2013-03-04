# Paperpress

This library will allow you to have a blog or static pages in markdown on top of any application with express. For feature request, contact @siedrix on twitter or github.

# Install

    npm install paperpress
    
# Usage

Create a paperpress paperpress intance

    var blog = new Paperpress({
        directory : 'static',
        basePath  : '/blog'
    });
    
Use **directory** to spacify where are your paperpress files and **basePath** to specify the path on your aplication where you want you paperpress to be deliver.

Then just add paperpress to your express server with

    blog.attach(server);
    
For more information check the example folder

# Directory structure

Then create a directory for you paperpress files. It needs the following directories

- **/articles** this folder will contain all the blog posts of the aplication.
- **/pages** this folder will contain all the pages of the aplication.
- **/layout** this containt the templates for the article and multiple article pages.
- **/public** this containes all assets particular to paperpress, like css, images, fonts and js.

# Article structure

- **info.json** This file needs to have title, description and date. Path is optional, will use a slugify version of the title if its not present.
- **content.md** This is the main content of the article, it should be written in mark up.

# Pages structure

- **info.json** This file needs to have title. Path is optional, will use a slugify version of the title if its not present.
- **content.md** This is the main content of the article, it should be written in mark up.

# Todos

- Pagination
- Static assets per post
- Comments
- Good looking design on example
- Wordpress to Paperpress script
- Scafolding

# Nice to haves

- Paperpress documentation site build on paperpress.
- Pages with no info.json should use directory name as title.

# Bugs

- Render links correctly

