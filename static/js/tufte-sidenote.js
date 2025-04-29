// Minimal JavaScript for mobile sidenote functionality
document.addEventListener('DOMContentLoaded', function() {
  // Only apply this script on mobile devices
  if (window.innerWidth <= 768) { // This should match your $min-width-breakpoint
    // Handle sidenote toggle functionality for mobile
    var sidenoteRefs = document.querySelectorAll('.sidenote-ref');
    
    sidenoteRefs.forEach(function(ref) {
      ref.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Find the associated sidenote
        var id = this.getAttribute('for');
        var sidenote = document.querySelector('.sidenote[for="' + id + '"]');
        
        // Toggle active class on sidenote
        if (sidenote) {
          sidenote.classList.toggle('active');
        }
      });
    });

    // Close sidenotes when clicking elsewhere
    document.addEventListener('click', function(e) {
      if (!e.target.classList.contains('sidenote-ref') && 
          !e.target.classList.contains('sidenote')) {
        document.querySelectorAll('.sidenote.active').forEach(function(note) {
          note.classList.remove('active');
        });
      }
    });
  }
});
