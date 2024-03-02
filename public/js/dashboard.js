var receiver_id = "";
var socket = io("/user-namespace", {
    auth: {
        token,
        name,
    },
});

$(document).ready(function () {
    $(".user-list").click(function () {
        var userId = $(this).attr("data-id");
        receiver_id = userId;
        $(".start-head").hide();
        $(".chat-section").show();

        socket.emit("existsChat", {
            sender_id: sender_id,
            receiver_id: receiver_id,
        })
    });
});

//update user status
socket.on("getOnlineUser", function (data) {
    $(`#${data.user_id}-status`)
        .removeClass("badge-danger")
        .addClass("badge-success")
        .text("Online");
});

socket.on("getOfflineUser", function (data) {
    $(`#${data.user_id}-status`)
        .removeClass("badge-success")
        .addClass("badge-danger")
        .text("Offline");
});

//chat save of user
$("#chat-form").submit(function (e) {
    e.preventDefault();
    var message = $("#message").val();
    if (message) {
        $.ajax({
            url: "/save-chat",
            type: "POST",
            data: {
                sender_id: sender_id,
                receiver_id: receiver_id,
                message: message,
            },

            success: function (response) {
                if (response.success) {
                    $("#message").val("");
                    let chat = response.data.message;
                    let html =
                        `
            <div class="current-user-chat">
              <h5>` +
                        chat +
                        `</h5>
            </div>
            `;
                    $("#chat-container").append(html);
                    scrollChat();
                    socket.emit("newChat", response.data);
                } else {
                    alert(response.message);
                }
            },
        });
    }
});

socket.on("loadNewChat", function (data) {
    if (sender_id === data.receiver_id || receiver_id === data.sender_id) {
        let chat = data.message;
        let html =
            `
    <div class="distance-user-chat">
      <h5>` +
            chat +
            `</h5>
    </div>
    `;
        $("#chat-container").append(html);
        scrollChat();
    }
});

// load old chats
socket.on("loadOldChat", function (data) {
    $("#chat-container").html("");
    data.forEach((chat) => {
        let html = "";
        if (chat.sender_id === receiver_id) {
            html = `
                <div class="distance-user-chat">
                    <h5>${chat.message}</h5>
                </div>
            `;
        } else {
            html = `
                <div class="current-user-chat">
                    <h5>${chat.message}</h5>
                </div>
            `;
        }
        $("#chat-container").append(html);
        scrollChat();
    });
});

function scrollChat() {
    $("#chat-container").animate({ scrollTop: $('#chat-container').prop("scrollHeight") }, 500);
}