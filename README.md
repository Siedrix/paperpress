# Paperpress

This library will allow you to have a blog or static pages in markdown on top of any application with express,koa or any other nodejs http server. For feature request, contact @siedrix on twitter or github.

# Install

    npm install paperpress
    
# Usage

Create a paperpress paperpress intance
```
    var paperpress = new Paperpress({
        baseDirectory : 'test/static'
    })
    paperpress.load()
``` 

Use **baseDirectory** to spacify where are your paperpress files and **uriPrefix** to specify the path on your aplication where you want you paperpress to be deliver.

## Deprecated paperpress.attach in favor of decouple from express
## Deprecated paperpress themes in favor of decouple from swig
    
For more information check the example folder

# Directory structure

Then create a directory for you paperpress files, each directory will be treated as a independent collection. Suggested directories:

- **/articles** this folder will contain all the blog posts of the aplication.
- **/pages** this folder will contain all the pages of the aplication.
- **/snippers** this folder will contain all the snippets of the aplication, usually single files.

# Collection item as directory

- **info.json** This file needs to have title, description and date. Path is optional, will use a slugify version of the title if its not present.
- **content.md** This is the main content of the article, it should be written in mark up.

# Collection item as file
- **[ITEM_NAME].md** This file will be converted to a collection item with title, slug, sugestedUri and content.

# Bugs

- Render links correctly

