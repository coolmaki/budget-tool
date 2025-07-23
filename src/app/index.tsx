import { ParentComponent } from "solid-js";

export class AppContextBuilder {
    private contextStack: ParentComponent[];

    public constructor() {
        this.contextStack = [];
    }

    public use(context: ParentComponent): AppContextBuilder {
        this.contextStack.push(context);
        return this;
    }

    public build(): ParentComponent {
        return this.contextStack.reduce(
            (AppContext, CurrentContext) => (props) => (
                <AppContext>
                    <CurrentContext>
                        {props.children}
                    </CurrentContext>
                </AppContext>
            ),
            (props) => props.children,
        );
    }
}