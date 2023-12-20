$(document).ready(function () {
    $.getJSON("video_conf.json", function (data) {
        // go through all sources
        $.each(data, function (key, val) {
            console.log(val);
            // for each source, add a box
            $("#video_holder").append(
                '<div class="col">' +
                    // for each box add a card containing video container
                    '<div id="video_container_' + val['source_id'] + '" class="card-show-popup card shadow-sm" data-bs-toggle="modal" data-bs-target="#exampleModal" style="cursor:pointer" data-id="' + val['source_id'] + '">' +
                        '<video autoplay="true" muted="muted" id="video-js-hover-' + val['source_id'] + '" class="video-js video-js-hover" data-video_id="' + val['source_id'] + '" preload="none" style="width:100%;height:270px;" poster="thumbnails/source_' + val['source_id'] + '.jpg" data-setup=\'{\"controls\":false}\'>' +
                            '<source src="hls/source_' + val['source_id'] + '_stream_360.m3u8" type="application/x-mpegURL">' +
                        '</video>' +
                    // for each box add a card title and description
                    '<div class="card-body">' +
                        '<h4>' + val['video_title'] + '</h4>' +
                        '<p class="card-text">' + val['video_description'] + '</p>' +
                    '</div>' +
                    '</div>' +
                '</div>'
            );

            // periodically update the thumbnail every second
            setInterval(function () {
                var currentTime = new Date().getTime();
                document.getElementById("video-js-hover-" + val['source_id']).poster = 'thumbnails/source_' + val['source_id'] + '.jpg?' + currentTime;
            }, 3000);
        });

        // listen for click event
        $(".card-show-popup").click(function () {
            var videoId = $(this).data('id');
        
            // function to get the appropriate video quality based on connection speed
            function getVideoQuality() {
                if (navigator.connection) {
                    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
                    // use downlink to determine the connection speed
                    if (connection.downlink >= 4) {
                        return '720';
                    } else if (connection.downlink >= 2) {
                        return '480';
                    } else {
                        return '360';
                    }
                } else {
                    // default to a reasonable quality if navigator.connection is not available
                    return '360';
                }
            }
        
            // determine initial video quality based on connection speed
            var initialQuality = getVideoQuality();
        
            var newMainPlayer = '<video id="main_video" class="video-js" controls preload="none" style="width:100%;height:500px;" poster="thumbnails/source_1.jpg" data-setup=' + '>' +
                '<source src="hls/source_' + videoId + '_stream_' + initialQuality + '.m3u8" type="application/x-mpegURL">' +
                '</video>';
        
            $("#main_video_holder").append(newMainPlayer);
        
            // set the source for the main_video
            var qualities = [
                { src: 'hls/source_' + videoId + '_stream_360.m3u8', type: 'application/x-mpegURL', label: '360', selected: false },
                { src: 'hls/source_' + videoId + '_stream_480.m3u8', type: 'application/x-mpegURL', label: '480', selected: false },
                { src: 'hls/source_' + videoId + '_stream_720.m3u8', type: 'application/x-mpegURL', label: '720', selected: false }
            ];
        
            // set the selected quality based on the initial quality
            var selectedQualityIndex = qualities.findIndex(function (quality) {
                return quality.label === initialQuality;
            });
            qualities[selectedQualityIndex].selected = true;
        
            videojs("main_video").src(qualities);
            videojs("main_video").poster('thumbnails/source_' + videoId + '.jpg');
        
            // set the main_video to play automatically
            videojs("main_video").autoplay(true);
        
            // add a dropdown menu to select qualities
            var qualityDropdown = '<select id="qualityDropdown">';
            qualities.forEach(function (quality) {
                qualityDropdown += '<option value="' + quality.src + '" ' + (quality.selected ? 'selected' : '') + '>' + quality.label + 'p</option>';
            });
            qualityDropdown += '</select>';
        
            $("#main_video_holder").append(qualityDropdown);
        
            // listen for quality change
            $("#qualityDropdown").change(function () {
                var selectedQuality = $("#qualityDropdown").val();
                videojs("main_video").src([{ src: selectedQuality, type: 'application/x-mpegURL' }]);
                videojs("main_video").play();
            });
        });
        


        // close the video and dispose when the modal is closed
        $('#exampleModal').on('hidden.bs.modal', function () {
            videojs("main_video").pause();
            videojs("main_video").dispose();
            // delete the dropdown menu element as well
            $("#qualityDropdown").remove();
        });

        //// use event delegation for hover events
        // listen for mouseenter event on the video_holder div
        $("#video_holder").on("mouseenter", ".video-js-hover", function () {
            var vid_id = $(this).data('video_id');
            videojs("video-js-hover-" + vid_id).play();
        });

        // listen for mouseleave event on the video_holder div
        $("#video_holder").on("mouseleave", ".video-js-hover", function () {
            var vid_id = $(this).data('video_id');
            videojs("video-js-hover-" + vid_id).dispose();
            var newPlayer = '<video autoplay="true" muted="muted" id="video-js-hover-' + vid_id + '" class="video-js video-js-hover" data-video_id="' + vid_id + '" preload="none" style="width:100%;height:270px;" poster="thumbnails/source_' + vid_id + '.jpg" data-setup=\'{\"controls\":false}\'>' +
                '<source src="hls/source_' + vid_id + '_stream_360.m3u8" type="application/x-mpegURL">' +
                '</video>';
            $("#video_container_" + vid_id).prepend(newPlayer);
        });
    });
});
