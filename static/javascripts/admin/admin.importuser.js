/**
 *
 */
$admin.CsvImportUser = {
    showMessage: function(msg, isError) {
        $("#message").css({'color': 'red'});
        $("#message").html(msg);
        $("#message").show();
    }
    ,hideMessage: function(msg, isError) {
        $("#message").hide();
    }
    ,importuser: function(form) {
        var files = form.children("[type='file']");
        if(files.length <= 0 || $(files[0]).val() == "")
            return;

        var crsf = $("#_csrf").val();
        var url = form.attr("action");

        if(url) {
            if(url.indexOf("?") < 0) {
                url += "?"
            }
        }

        var fd = new FormData();
        for (var i = 0; i < files[0].files.length; i++) {
            fd.append("csvfile", files[0].files[i]);
            break;
        }

        $admin.CsvImportUser.hideMessage();
        // formCsvImportUser
        $.ajax({
            url: url + "_csrf=" + crsf,
            type: "POST",
            async: false,
            data: fd,
            dataType: "json",
            contentType: false,
            processData: false,
            success: function (result) {
                if (result.error) {
                    $admin.CsvImportUser.showMessage(result.error.message);
                } else {
                    $admin.CsvImportUser.showMessage(result.data.message);
                }
            },
            error: function (err) {
                alert(err);
            }
        });
    }
    , bindDownloadForm: function(form) {
        form.submit(function() {
            $admin.CsvImportUser.hideMessage();
            return true;
        });
    }
    , bindImportForm: function(form) {
        form.submit(function() {
            $admin.CsvImportUser.importuser(form);
            return false;
        });
    }
};

$(document).ready(function(){
    $admin.CsvImportUser.bindDownloadForm($("#formCsvDownloadTemplate"));
    $admin.CsvImportUser.bindImportForm($("#formCsvImportUser"));
    $admin.CsvImportUser.hideMessage();
});
