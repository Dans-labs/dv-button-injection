(function($) {
    var hasDansCollection = $('#metadata_dansCollection td span a[href="https://vocabularies.dans.knaw.nl/collections/ssh/cfa04ed6-4cd0-4651-80cb-ed4ca8fa14f3"]').length > 0;
    var hasOralHistory = $('#metadata_keyword td:contains("oral history")').length > 0;

    if (hasDansCollection || hasOralHistory) {
        // Create the panel structure
        var $panel = $('<div class="panel panel-default" style="margin-top: 1em">');
        var $panelBody = $('<div class="panel-body">');
        var currentUrl = window.location.href;

        // Add the advanced edit button to the panel body
        var $wrapper = $('<div>'); // This wrapper will hold the button and the API token display

        // Append everything to the panel body
        $panelBody.append($wrapper);

        // Append the panel body to the panel
        $panel.append($panelBody);

        // Now append the panel to #actionButtonBlock
        $('#actionButtonBlock').append($panel);

        function displayToken(apiToken) {
            $wrapper.append(
                $('<a>', {
                    href: `https://ohsmart.dansdemo.nl?source=${encodeURIComponent(currentUrl)}&token=${apiToken}`,
                    target: '_blank',
                    class: 'btn btn-info',
                    style: 'width: 100%; display: inline-block; margin-bottom: 0.5em;'
                }).html('<span class="glyphicon glyphicon-share" aria-hidden="true"></span> Advanced Edit')
            );

            $wrapper.append(
                $('<p>').append(
                    $('<small>').text('Copy your API key below to use in the advanced editing app')
                )
            );
            // Create the input group wrapper
            var $inputGroup = $('<div class="input-group">');
            
            // Create the input field with the API token value (readonly)
            var $inputField = $('<input type="text" class="form-control" readonly>').val(apiToken);
            $inputGroup.append($inputField);

            // Create the button for copying the API key
            var $copyButton = $('<button class="btn btn-default" type="button">Copy!</button>');
            
            // Wrap the button in a span with class "input-group-btn"
            var $buttonWrapper = $('<span class="input-group-btn">').append($copyButton);
            $inputGroup.append($buttonWrapper);

            // Append the input group to the wrapper
            $wrapper.append($inputGroup);

            // Add event listener to the copy button
            $copyButton.on('click', function(e) {
                // Select the text inside the input field
                $inputField[0].select();
                $inputField[0].setSelectionRange(0, 99999); // For mobile devices

                // Try to copy the selected text to the clipboard
                try {
                    e.preventDefault();
                    var successful = document.execCommand('copy');
                    if (successful) {
                        alert('API key copied to clipboard!');
                    } else {
                        alert('Failed to copy the API key.');
                    }
                } catch (err) {
                    console.error('Failed to copy: ', err);
                    alert('Failed to copy the API key.');
                }
            });
        }

        $.get('/dataverseuser.xhtml?selectTab=apiTokenTab', function(data) {
            var html = $('<div>').html(data);

            var content = html.find('#dataverseUserForm');
            var apiToken = content.find('#dataverseUserForm\\:dataRelatedToMeView\\:apiTokenTab code').text().trim();

            if (apiToken && !apiToken.startsWith('API Token')) {
                // API key already present
                console.log(apiToken);
                displayToken(apiToken);
            }
            else {
                var hiddenFields = content.find('input[type="hidden"]');
                var postData = {};
                hiddenFields.each(function() {
                    postData[$(this).attr('name')] = $(this).val();
                });

                // Get the submit button and add it to postData
                var submitButton = content.find('button[type="submit"]');
                var buttonName = submitButton.attr('name');
                var buttonValue = submitButton.val();

                if (buttonName) {
                    postData[buttonName] = buttonValue;
                }

                $.ajax({
                    url: '/dataverseuser.xhtml?selectTab=apiTokenTab',
                    method: 'POST',
                    data: postData,
                    success: function(response) {
                        console.log('Success!', response);
                        const responseHtml = $('<div>').html(response);
                        apiToken = responseHtml.find('#dataverseUserForm\\:dataRelatedToMeView\\:apiTokenTab code').text().trim();
                        displayToken(apiToken);    
                    },
                    error: function(xhr, status, error) {
                      console.error('Error:', error);
                    }
                });

            }
        });
 
    } else {
        console.log('No matching elements found — nothing injected.');
    }
})(jQuery);
