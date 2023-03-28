<!-- This READM is based on the BEST-README-Template (https://github.com/othneildrew/Best-README-Template) -->
<div id="top"></div>
<!-- PROJECT LOGO -->
<br />
<div align="center">
    <a href="https://github.com/iotaledger/template">
        <img src="banner.png" alt="Banner">
    </a>
    <h3 align="center">EVM Toolkit</h3>
    <p align="center">
        A frontend based on Svelte, which allows faucet requests and withdraws of the users assets over the JSON RPC of Wasp. 
        In combination with Metamask the users can access and handle their funds. 
        <br />
        <br />
        <a href="https://github.com/iotaledger/evm-toolkit/labels/bug">Report Bug</a>
        ·
        <a href="https://github.com/iotaledger/evm-toolkit/labels/request">Request Feature</a>
    </p>
</div>



<!-- TABLE OF CONTENTS -->
<!-- TODO 
Edit the ToC to your needs. If your project is part of the wiki, you should link directly to the Wiki where possible and remove unneeded sections to prevent duplicates 
-->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
     <a href="#built-with">Built With</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>


<p align="right">(<a href="#top">back to top</a>)</p>


<!-- TODO
This section should list any major frameworks/libraries used to bootstrap your project. Leave any add-ons/plugins for the acknowledgements section. Here are a few examples:
-->
### Built With

* [Svelte](https://svelte.dev/)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites


* Docker


### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/iotaledger/evm-toolkit.git
   ```
3. Build image
   ```sh
   docker build -t evm-toolkit .
   ```
4. Run toolkit
   ```sh
   docker run -p 127.0.0.1:8080:80 evm-toolkit
   ```

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the Apache License. See `LICENSE` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>
