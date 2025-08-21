export default {
  async fetch(request, env, ctx) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const after = thirtyDaysAgo.toISOString();
      const afterDate = thirtyDaysAgo.toISOString().split("T")[0];

      const blogApiUrl = `https://developer.woocommerce.com/wp-json/wp/v2/posts/?after=${after}&per_page=100&_fields=title,date,excerpt,link`;
      const query = encodeURIComponent(
        `is:pr repo:woocommerce/woocommerce label:Documentation state:closed closed:>${afterDate}`
      );
      const githubApiUrl = `https://api.github.com/search/issues?q=${query}&sort=updated&order=desc&per_page=100`;

      const [blogResponse, prResponse] = await Promise.all([
        fetch(blogApiUrl),
        fetch(githubApiUrl, {
          headers: {
            Authorization: `Bearer ${env.GITHUB_TOKEN}`,
            "User-Agent": "woocommerce-blog-helper",
            Accept: "application/vnd.github.v3+json",
          },
        }),
      ]);

      if (!blogResponse.ok) {
        throw new Error(`Blog API request failed: ${blogResponse.status}`);
      }

      if (!prResponse.ok) {
        const errorText = await prResponse.text();
        throw new Error(
          `GitHub API request failed: ${prResponse.status} - ${errorText}`
        );
      }

      const [posts, prs] = await Promise.all([
        blogResponse.json(),
        prResponse.json(),
      ]);

      let textOutput = `# WooCommerce Developer Blog Posts (Last 30 Days)\n\n`;
      textOutput += `Found ${posts.length} posts\n\n`;

      posts.forEach((post, index) => {
        const postDate = new Date(post.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const cleanExcerpt = post.excerpt.rendered
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#8217;/g, "'")
          .replace(/&#8220;/g, '"')
          .replace(/&#8221;/g, '"')
          .replace(/&#8230;/g, "...")
          .replace(/&#038;/g, "&")
          .replace(/[\r\n\t]/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        textOutput += `${index + 1}. [${post.title.rendered}](${post.link}) ${cleanExcerpt} (${postDate})\n`;
      });

      if (posts.length === 0) {
        textOutput += `No posts found in the last 30 days.\n`;
      }

      textOutput += `\n## WooCommerce Documentation PRs (Last 30 Days)\n\n`;
      textOutput += `Found ${prs.items.length} merged documentation PRs\n\n`;

      prs.items.forEach((pr, index) => {
        textOutput += `${index + 1}. ${pr.title} [#${pr.number}](${pr.html_url})\n`;
      });

      if (prs.items.length === 0) {
        textOutput += `No documentation PRs found in the last 30 days.\n`;
      }

      return new Response(textOutput, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      const errorText = `Error fetching blog posts: ${error.message}`;
      return new Response(errorText, {
        status: 500,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
        },
      });
    }
  },
};
