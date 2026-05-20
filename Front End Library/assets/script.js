(function() {
  //Don't know why doesn't work the 
  //html5 required in Mozilla and Safary in Codepen :S
  //Here it works correctly http://jsfiddle.net/sj2Em/
  jQuery(function() {
    $('.input-txt').on('focus', function() {
      var $container, $this, nPosition;
      $container = $('.container');
      $this = $(this);
      nPosition = $this.data('pos');
      return $container.attr('data-position', nPosition);
    });
    $('.input-txt').bind('invalid', function() {
      return $('.container').addClass('error');
    });
    return $('.input-txt').bind('blur', function() {
      return $('.container').removeClass('error');
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiPGFub255bW91cz4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRW1EO0VBQUE7OztFQUVuRCxNQUFBLENBQU8sUUFBQSxDQUFBLENBQUE7SUFDTCxDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsRUFBaEIsQ0FBbUIsT0FBbkIsRUFBNEIsUUFBQSxDQUFBLENBQUE7QUFDOUIsVUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBO01BQUksVUFBQSxHQUFhLENBQUEsQ0FBRSxZQUFGO01BQ2IsS0FBQSxHQUFRLENBQUEsQ0FBRSxJQUFGO01BQ1IsU0FBQSxHQUFZLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBWDthQUNaLFVBQVUsQ0FBQyxJQUFYLENBQWdCLGVBQWhCLEVBQWlDLFNBQWpDO0lBSjBCLENBQTVCO0lBTUEsQ0FBQSxDQUFFLFlBQUYsQ0FBZSxDQUFDLElBQWhCLENBQXFCLFNBQXJCLEVBQWdDLFFBQUEsQ0FBQSxDQUFBO2FBQzlCLENBQUEsQ0FBRSxZQUFGLENBQWUsQ0FBQyxRQUFoQixDQUF5QixPQUF6QjtJQUQ4QixDQUFoQztXQUdBLENBQUEsQ0FBRSxZQUFGLENBQWUsQ0FBQyxJQUFoQixDQUFxQixNQUFyQixFQUE2QixRQUFBLENBQUEsQ0FBQTthQUMzQixDQUFBLENBQUUsWUFBRixDQUFlLENBQUMsV0FBaEIsQ0FBNEIsT0FBNUI7SUFEMkIsQ0FBN0I7RUFWSyxDQUFQO0FBRm1EIiwic291cmNlc0NvbnRlbnQiOlsiI0Rvbid0IGtub3cgd2h5IGRvZXNuJ3Qgd29yayB0aGUgXG4jaHRtbDUgcmVxdWlyZWQgaW4gTW96aWxsYSBhbmQgU2FmYXJ5IGluIENvZGVwZW4gOlNcbiNIZXJlIGl0IHdvcmtzIGNvcnJlY3RseSBodHRwOi8vanNmaWRkbGUubmV0L3NqMkVtL1xuXG5qUXVlcnkgLT5cbiAgJCgnLmlucHV0LXR4dCcpLm9uICdmb2N1cycsIC0+XG4gICAgJGNvbnRhaW5lciA9ICQoJy5jb250YWluZXInKVxuICAgICR0aGlzID0gJChAKVxuICAgIG5Qb3NpdGlvbiA9ICR0aGlzLmRhdGEoJ3BvcycpXG4gICAgJGNvbnRhaW5lci5hdHRyKCdkYXRhLXBvc2l0aW9uJywgblBvc2l0aW9uKVxuICAgXG4gICQoJy5pbnB1dC10eHQnKS5iaW5kICdpbnZhbGlkJywgLT5cbiAgICAkKCcuY29udGFpbmVyJykuYWRkQ2xhc3MoJ2Vycm9yJylcbiAgICBcbiAgJCgnLmlucHV0LXR4dCcpLmJpbmQgJ2JsdXInLCAtPlxuICAgICQoJy5jb250YWluZXInKS5yZW1vdmVDbGFzcygnZXJyb3InKVxuIl19
//# sourceURL=coffeescript