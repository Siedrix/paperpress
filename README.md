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
- **/themes** this folder will contain your themes
- **/themes/mytheme** this folder will contain your theme files
- **/themes/mytheme/layout** this containt the templates for the article and multiple article pages of your theme.
- **/themes/mytheme/public** this containes all assets particular to paperpress, like css, images, fonts and js of your theme.

# Article structure

- **info.json** This file needs to have title, description and date. Path is optional, will use a slugify version of the title if its not present.
- **content.md** This is the main content of the article, it should be written in mark up.

# Pages structure

- **info.json** This file needs to have title. Path is optional, will use a slugify version of the title if its not present.
- **content.md** This is the main content of the article, it should be written in mark up.

# Themes
To configure your theme you need to configure your paperpress intance like this:

    var blog = new Paperpress({
        directory : 'static',
        basePath  : '/blog',
        themePath : 'static/themes/mytheme',
        staticPath: 'static',
    });
    
Use **themePath** to specify where are your paperpress theme files and **staticPath** to specify the path you want to serve your static files.

Then in your layout files use the context varible **{{ static }}** to print the static url.


# Scafolding

For scafolding check this [yeoman repo](https://github.com/Siedrix/generator-paperpress).

# Todos

- Snippets
- Pagination
- Categorias
- Exposed article, pages, snipped object

# Nice to haves

- Paperpress documentation site build on paperpress.
- Pages with no info.json should use directory name as title.

# Bugs

- Render links correctly

