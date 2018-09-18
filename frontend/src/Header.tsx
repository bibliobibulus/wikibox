import { fromNullable } from "fp-ts/lib/Option";
import React, { Component } from "react";
import {
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
  UncontrolledDropdown
} from "reactstrap";
import Api from "./api";
import { Consumer } from "./Context";
import markdown from "./markdown";

interface HeaderState {
  isOpen: boolean;
  title: string;
  navigation: Array<{
    href: string;
    text: string;
    subnavigation: Array<{ href: string; text: string }>;
  }>;
}

const isDropDownColorDark = [
  "darkly",
  "slate",
  "superhero",
  "solar",
  "cyborg",
  "yeti"
].includes(process.env.NODE_ENV || "");

const isDropdownColorLight = [
  "cerulean",
  "litera",
  "materia",
  "sandstone",
  "cosmo",
  "flatly",
  "lumen",
  "minty",
  "simplex",
  "united",
  "journal",
  "lux",
  "pulse",
  "sketchy",
  "spacelab"
].includes(process.env.NODE_ENV || "");

export default class Header extends Component<{}, HeaderState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      isOpen: false,
      navigation: [],
      title: ""
    };
    this.handleTogglerClick = this.handleTogglerClick.bind(this);
  }
  public handleTogglerClick() {
    const isOpen = !this.state.isOpen;
    this.setState({
      isOpen
    });
  }
  public componentDidMount() {
    (async () => {
      const api = new Api();
      const response = await api.getData("header.md");
      const div = document.createElement("div");
      div.innerHTML = await markdown(response || "");
      const h1 = fromNullable(div.querySelector("h1"))
        .map($h1 => $h1.innerHTML)
        .getOrElse("");
      const title = fromNullable(document.querySelector("title"))
        .map($title => ($title.innerHTML = h1))
        .getOrElse("");
      const navigation = fromNullable(div.querySelector("ul"))
        .map(ul =>
          Array.from(ul.children).map(child => {
            const subnavigation = Array.from(child.querySelectorAll("li")).map(
              subitem => {
                const b = fromNullable(subitem.querySelector("a"));
                return {
                  href: b.map($b => $b.href).getOrElse(""),
                  text: b.map($b => $b.innerHTML).getOrElse("")
                };
              }
            );
            const a = fromNullable(child.querySelector("a"));
            return {
              href: a.map($a => $a.href).getOrElse(""),
              subnavigation,
              text: a.map($a => $a.innerHTML).getOrElse("")
            };
          })
        )
        .getOrElse([]);
      this.setState({
        navigation,
        title
      });
    })();
  }
  public render() {
    const $HeaderItems = this.state.navigation.map(item => {
      if (item.subnavigation.length === 0) {
        return (
          <NavItem key={item.text}>
            <NavLink href={item.href}>{item.text}</NavLink>
          </NavItem>
        );
      } else {
        const DropdownItems = item.subnavigation.map((subitem: any) => (
          <DropdownItem key={subitem.text}>
            <NavLink href={subitem.href} className={isDropDownColorDark?'text-light':'text-dark'}>{subitem.text}</NavLink>
          </DropdownItem>
        ));
        return (
          <UncontrolledDropdown key={item.text} nav={true} inNavbar={true}>
            <DropdownToggle nav={true} caret={true}>
              {item.text}
            </DropdownToggle>
            <DropdownMenu>{DropdownItems}</DropdownMenu>
          </UncontrolledDropdown>
        );
      }
    });
    const $Header = ({ token }: any) => (
      <Navbar
        color={token ? "success" : "primary"}
        dark={true}
        expand="md"
      >
        <NavbarToggler onClick={this.handleTogglerClick} />
        <NavbarBrand href="./">{this.state.title}</NavbarBrand>
        <Collapse navbar={true} isOpen={this.state.isOpen}>
          <Nav navbar={true}>{$HeaderItems}</Nav>
        </Collapse>
      </Navbar>
    );
    return <Consumer>{({ token }: any) => <$Header token={token} />}</Consumer>;
  }
}
