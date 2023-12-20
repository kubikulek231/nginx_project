$(document).ready(function () {
    $.getJSON( "video_conf.json", function( data ) {
        // add video boxes
        $.each( data, function( key, val ) {
            console.log(val)
            $( "#video_holder" ).append(
                '<div class="col">' + 
                    '<div class="card-show-popup card shadow-sm" data-bs-toggle="modal" data-bs-target="#exampleModal" style="cursor:pointer" data-id="'+val['source_id']+'">' +
                        // '<img src="thumbnails/source_'+val['source_id']+'.jpg"/>' +
                        '<video autoplay="true" muted="muted" id="video-js-hover-'+val['source_id']+'" class="video-js video-js-hover" data-video_id="'+val['source_id']+'" preload="none" style="width:100%;height:270px;" poster="thumbnails/source_'+val['source_id']+'.jpg" data-setup=\'{\"controls\":false}\'>' +
                            '<source src="hls/source_' + val['source_id'] + '_stream_360.m3u8" type="application/x-mpegURL">' + 
                        '</video>' + 
                        '<div class="card-body">' + 
                            '<h4>'+val['video_title']+'</h4>' +
                            '<p class="card-text">'+val['video_description']+'</p>'+
                        '</div>'+
                    '</div>'+
                '</div>' 
            );
        });

        
      // listen for click event
      $(".card-show-popup").click(function(){
        videojs("main_video").src([
            //{ src: $(this).data('url') + '_stream_360.m3u8', type: 'application/x-mpegURL', label: '360P' },
            //{ src: $(this).data('url') + '_stream_480.m3u8', type: 'application/x-mpegURL', label: '480P' },
            { src: 'hls/source_' + $(this).data('id') + '_stream_720.m3u8', type: 'application/x-mpegURL', label: '720P', selected: true }
        ]);
        videojs("main_video").poster('thumbnails/source_'+$(this).data('id')+'.jpg');
      });

      $('.video-js-hover').hover(
        function () {
            var vid_id = $(this).data('video_id');
            videojs("video-js-hover-"+vid_id).play();
         }, 
         function () {
            var vid_id = $(this).data('video_id');
            videojs("video-js-hover-"+vid_id).pause();
            // dunno how to dispose the video while preserving thumbnail (me dumb)
            // videojs("video-js-hover-" + vid_id).dispose();
            
         }
      )

    });
});