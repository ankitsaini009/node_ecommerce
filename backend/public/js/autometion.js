//autometion js
$(document).ready(function () {
  function generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  $(document).on("click", ".generateDescBtn", function () {
    var productName = $('input[name="name"]').val();
    var shortDescription = $('textarea[name="short_description"]').val() || "";

    if (!productName) {
      Swal.fire("Error", "Please enter product name first.", "error");
      return;
    }

    $.ajax({
      url: "/api/ai/generate-description",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        productName: productName,
        shortDescription: shortDescription,
      }),

      beforeSend: function () {
        Swal.fire({
          title: "Generating Content...",
          text: "AI is creating product details & SEO data.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      },

      success: function (response) {
        Swal.close();

        if (response.success && response.data.length > 0) {
          const data = response.data[0];

          $('textarea[name="short_description"]').val(
            data.shortDescription || "",
          );
          $('textarea[name="description"]').val(data.productDescription || "");
          $('input[name="sku"]').val(data.sku || "");
          $('input[name="meta_title"]').val(data.metaTitle || "");
          $('textarea[name="meta_description"]').val(
            data.metaDescription || "",
          );
          $('input[name="meta_keywords"]').val(data.metaKeywords || "");

          const productName = $('input[name="name"]').val();
          $('input[name="slug"]').val(generateSlug(productName));

          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Product details generated successfully.",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire("Error", "AI failed to generate description.", "error");
        }
      },

      error: function (xhr) {
        Swal.close();

        console.log("AI Error:", xhr.responseText);

        Swal.fire("Error", "AI generation failed. Check console.", "error");
      },
    });
  });

  $(document).on("click", ".generateBlogDescBtn", function () {
    const title = $('input[name="title"]').val();

    if (!title) {
      Swal.fire("Error", "Enter blog title first.", "error");
      return;
    }

    $.ajax({
      url: "/api/ai/generate-blog",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ title }),

      beforeSend: function () {
        Swal.fire({
          title: "Generating Blog...",
          text: "AI is creating blog content.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      },

      success: function (response) {
        Swal.close();
        if (response.success) {
          $(".aiContent").val(response.data.content);
        }
      },
      error: function (xhr) {
        Swal.close();
        console.log("AI Error:", xhr.responseText);
        Swal.fire("Error", "AI generation failed. Check console.", "error");
      },
    });
  });
  $(document).on("click", ".generateCouponCode", function () {
    $.ajax({
      url: "/api/ai/generate-coupon-code",
      method: "POST",
      contentType: "application/json",
      data: "{}",

      beforeSend: function () {
        Swal.fire({
          title: "Generating Coupon Code...",
          text: "AI is creating coupon code.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
      },

      success: function (response) {
        Swal.close();
        if (response.success) {
          $(".couponCodeInput").val(response.reply.trim().toUpperCase());
        }
      },
      error: function (xhr) {
        Swal.close();
        console.log("AI Error:", xhr.responseText);
        Swal.fire("Error", "AI generation failed. Check console.", "error");
      },
    });
  });

  $(".chatbotToggle").click(function () {
    $(".chatPopup").toggleClass("active");
  });

  $(".closeChat").click(function () {
    $(".chatPopup").removeClass("active");
  });

  function scrollToBottom() {
    $(".chatBody")
      .stop()
      .animate(
        {
          scrollTop: $(".chatBody")[0].scrollHeight,
        },
        300,
      );
  }

  function addUserMessage(message) {
    $(".chatBody").append(`<div class="user-message">${message}</div>`);
    scrollToBottom();
  }

  function addBotMessage(message) {
    $(".chatBody").append(`<div class="bot-message">${message}</div>`);
    scrollToBottom();
  }

  function showTyping() {
    $(".chatBody").append(
      `<div class="typing-bubble">
      <img src="/images/dot-dot-typing.gif" alt="Typing..." class="typing"  max-width="100px" max-height="100px"/>
    </div>`,
    );
    scrollToBottom();
  }

  function removeTyping() {
    $(".typing").remove();
  }

  function sendMessage() {
    const message = $(".chatInput").val().trim();
    if (!message) return;

    addUserMessage(message);
    $(".chatInput").val("");
    $(".sendMessage").prop("disabled", true);

    showTyping();

    $.ajax({
      url: "/api/ai/chat",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ message: message }),
      success: function (response) {
        removeTyping();
        addBotMessage(response.reply);
      },
      error: function () {
        removeTyping();
        addBotMessage("⚠️ Something went wrong. Try again.");
      },
      complete: function () {
        $(".sendMessage").prop("disabled", false);
      },
    });
  }

  $(".sendMessage").click(function () {
    sendMessage();
  });

  $(".chatInput").keypress(function (e) {
    if (e.which === 13) {
      sendMessage();
    }
  });
});
