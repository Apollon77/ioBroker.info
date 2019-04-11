/* global systemLang, dateOptions, adapterConfig, stargazers */

function showIssues() {

    async function getIssues() {
        const adapters = window.top.gMain.tabs.adapters.curInstalled;
        if (adapters && typeof adapters === "object") {
            $('#adapterIssueList').empty();
            $('#adapterIssueListLoader').remove();
            let counter = 0;
            await asyncForEach(Object.keys(adapters), async function (key) {
                if (key !== "hosts") {
                    counter++;
                    const adapter = adapters[key];
                    const $item = $('#forumEntryTemplate').children().clone(true, true);
                    $item.find('.label-success').remove();

                    const full_name = adapter.readme.substring(adapter.readme.indexOf(".com/") + 5, adapter.readme.indexOf("/blob/"));

                    const fullNameId = full_name.replace("/", "ISSUE-ISSUE").replace(".", "ISSUE-PUNKT-ISSUE");

                    $item.find('.titleLink').text(adapter.title).attr('href', "https://github.com/" + full_name + "/issues");
                    $item.find('.collapse-link').attr("data-adapter", fullNameId).addClass("loadAdapterIssues");

                    let button = "<div class='text-center'>";
                    button += "<button type='button' data-adapter='" + adapter.title + ": " + adapter.version + "' data-href='https://api.github.com/repos/" + full_name + "/issues' class='btn btn-primary create-issue-adapter-button" + (adapterConfig.github_token ? "" : " disabled") + "'>";
                    button += "<i class='fa fa-plus fa-lg'></i> ";
                    button += _("add new request");
                    button += "</button>";
                    button += "</div>";

                    const ul = $('<ul/>').attr("id", "issue_" + fullNameId).addClass("list-unstyled timeline").attr('style', "margin-bottom: 3px;");
                    $item.find('.y_title').addClass('spoiler-content').css('padding-left', '20px');
                    $item.find('.y_content').addClass('spoiler-content').css('display', 'none').css('background-color', 'cornsilk').empty().append($(button)).append(ul).append($(button));

                    $('#adapterIssueList').append($item);
                }
            });

        }
        if (adapterConfig.adapter_issue_closed) {
            $('#knownIssuesBlock').find('.x_title a.collapse-link').click();
        }
    }

    getIssues();
}

function addStarsToAdapterIssues() {
    const adapters = window.top.gMain.tabs.adapters.curInstalled;
    adapters.forEach(function (key) {
        if (key !== "hosts") {
            const adapter = adapters[key];
            const full_name = adapter.readme.substring(adapter.readme.indexOf(".com/") + 5, adapter.readme.indexOf("/blob/"));
            const fullNameId = full_name.replace("/", "ISSUE-ISSUE").replace(".", "ISSUE-PUNKT-ISSUE");
            const stars = stargazers[fullNameId];
            if (stars) {
                let number = stars.count;
                if (number < 9) {
                    number += "&nbsp;&nbsp;";
                } else if (number < 99) {
                    number += "&nbsp;";
                }
                const starCounter = "<span class='badge" + (stars.starred ? ' badge-success' : '') + "' id='starsCounter" + fullNameId + "'>" + number + "</span>";
                $('*[data-adapter="' + fullNameId + '"]').insertBefore(starCounter);
            }
        }
    });
}

async function getAndWriteIssuesFor(id) {
    const full_name = id.replace("ISSUE-ISSUE", "/").replace("ISSUE-PUNKT-ISSUE", ".").split("/");
    let allIssues;
    $("<div class='loader3 loader-small' id='loader_" + id + "'></div>").insertBefore("#issue_" + id);
    if (adapterConfig.github_token) {
        allIssues = await getAllIssues(full_name[0], full_name[1]);
        await writeAllIssuesV4(allIssues, "issue_" + id);
    } else {
        allIssues = await getAllIssuesFromAdapter(full_name);
        await writeAllIssues(allIssues, "issue_" + id);
    }
    $("#loader_" + id).remove();
}