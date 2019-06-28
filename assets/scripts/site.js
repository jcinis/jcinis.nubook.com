/**

Site
    pages
    categories



API:
    files
    images
    pages
    templates
    
    
    
    user/renders/
    user/renders/:id
        
    user/categories/:id


page
    id
    title
    slug
    date
    render
    image_url
    thumbnail_url


*/


PageView = Backbone.View.extend({
    tagName : "div",
    className : "page",
    render : function() {
        alert(this.model.title);
        return this;
    }
});